using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NutriDripp_CP.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using System.Windows;
using Timer = System.Timers.Timer;

namespace NutriDripp_CP
{
    public partial class Splash : Window
    {
        Timer StartupTimer = new Timer();
        WebClient Dclient = new WebClient();

        bool ExitArg = false;
        string DLocation = App.Temp + @"\Update.exe";

        public Splash()
        {
            InitializeComponent();

            CurrentVersionBuildTB.Text = "Version: " + App.Version + ", Build: " + App.Build;

            Dclient.DownloadProgressChanged += Dclient_DownloadProgressChanged;
            Dclient.DownloadFileCompleted += Dclient_DownloadFileCompleted;

            StartupTimer.Elapsed += StartupTimer_Elapsed; ;
            StartupTimer.Interval = 1000;
            StartupTimer.Start();
        }

        private void CloseBtn_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (!ExitArg)
            {
                try
                {
                    var MD = MessageBox.Show("Are you sure you want to abort the control panel startup?", "Confirm Exit", MessageBoxButton.YesNo, MessageBoxImage.Question);
                    if (MD == MessageBoxResult.No) e.Cancel = true;

                    if (e.Cancel == false) Functions.Shutdown();
                }
                catch { }
            }
        }

        private async void StartupTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            StartupTimer.Stop();
            bool onlineStartup = true;

            /////////////////////////////////////////////////////////////////////////////////

            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 5;
                LoadingProgressTB.Text = "Verifing system API...";
            })); 
            await Task.Run(new Action(() => Thread.Sleep(250)));

            Version API = Environment.OSVersion.Version;
            if (!(double.Parse(API.Major.ToString() + "." + API.Minor.ToString()) >= App.MinAPIV))
            {
                Functions.MSG("BadAPI");
                Functions.Shutdown();
            }

            /////////////////////////////////////////////////////////////////////////////////

            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 15;
                LoadingProgressTB.Text = "Scanning local data...";
            }));
            await Task.Run(new Action(() => Thread.Sleep(500)));

            if (!Directory.Exists(App.DataDir)) Directory.CreateDirectory(App.DataDir);
            if (!File.Exists(App.DataDir + @"\Version")) File.WriteAllText(App.DataDir + @"\Version", App.Build.ToString());

            /////////////////////////////////////////////////////////////////////////////////

            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 30;
                LoadingProgressTB.Text = "Checking internet connection...";
            }));
            await Task.Run(new Action(() => Thread.Sleep(250)));

            int Trys = 3;
        Looper:;
            bool[] Connection = Functions.CheckConnection();
            if (Connection[0])
            {
                if (Connection[1])
                {
                    /////////////////////////////////////////////////////////////////////////////////
                    
                    Dispatcher.Invoke(new Action(() => {
                        LoadingProgressBar.Value = 40;
                        LoadingProgressTB.Text = "Checking for updates...";
                    }));
                    await Task.Run(new Action(() => Thread.Sleep(500)));
                    try
                    {
                        string RawResponse = await Functions.SendServerAsync("General.php", new Dictionary<string, string> {
                            { "Func", "4" }
                        }, ShowLoading: false);

                        if (RawResponse != "IErr")
                        {
                            JObject SR = (JObject)JsonConvert.DeserializeObject(RawResponse);

                            if (SR["ReturnCode"].Value<int>() == 1)
                            {
                                JObject CP = SR["Payload"].Value<JObject>();

                                if (CP["Build"].Value<int>() > App.Build)
                                {
                                    var UD = MessageBox.Show("A newer version of this software was found, would you like to install it now?", "Update Found", MessageBoxButton.YesNo, MessageBoxImage.Question);
                                    if (UD == MessageBoxResult.Yes)
                                    {
                                        Update(CP["Build"].Value<int>().ToString());
                                        return;
                                    }
                                }
                            } else {
                                Functions.MSG("Error", "0x006");
                            }
                        }
                    }
                    catch
                    {
                        if (Trys < 1)
                        {
                            Functions.MSG("Error", "0x004");
                        }
                        else
                        {
                            Trys--;
                            goto Looper;
                        }
                    }
                }
                else
                {
                    if (Trys < 1)
                    {
                        if (Functions.MSG("NoServerQuery") != MessageBoxResult.Yes)
                            Functions.Shutdown();

                        onlineStartup = false;
                    }
                    else
                    {
                        Trys--;
                        goto Looper;
                    }
                }
            }
            else
            {
                if (Trys < 1)
                {
                    if (Functions.MSG("NoConnectionQuery") != MessageBoxResult.Yes)
                        Functions.Shutdown();

                    onlineStartup = false;
                }
                else
                {
                    Trys--;
                    goto Looper;
                }
            }

            /////////////////////////////////////////////////////////////////////////////////

        DoTheHardwareConnection:;
            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 55;
                LoadingProgressTB.Text = "Waiting for hardware connection...";
            }));
            await Task.Run(new Action(() => Thread.Sleep(500)));

            if (App.Mothership != null) App.Mothership.Disconnect();

            App.Mothership = new ControllerModule();
            while (!await App.Mothership.ConnectAsync());

            /////////////////////////////////////////////////////////////////////////////////

        DoTheHardwareValidation:;
            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 80;
                LoadingProgressTB.Text = "Validating hardware boot sequence...";
            }));
            await Task.Run(new Action(() => Thread.Sleep(250)));

            DateTime TValidationStartTime = DateTime.Now;
            while ((!await App.Mothership.UpdateModuleDataAsync() || (int)App.Mothership.Status < 1)
                && TValidationStartTime + TimeSpan.FromSeconds(10) > DateTime.Now);

            if ((int)App.Mothership.Status < 1)
            {
                MessageBoxResult failedValidationDialog = MessageBoxResult.None;
                await Task.Run(new Action(() => {
                    failedValidationDialog = MessageBox.Show($"Failed to validate the boot sequence for the currently connected hardware ({App.Mothership.Name}), do you want to try again?" + Environment.NewLine
                                                           + Environment.NewLine
                                                           + $"Yes: Try to validate ({App.Mothership.Name}) boot sequence again." + Environment.NewLine
                                                           + "No: Return to earch and connect to another device." + Environment.NewLine
                                                           + "Cancel: Abort NutriDripp control panel startup.", "Validation Failed", MessageBoxButton.YesNoCancel, MessageBoxImage.Warning);
                }));

                switch (failedValidationDialog)
                {
                    case MessageBoxResult.Yes:
                        goto DoTheHardwareValidation;

                    case MessageBoxResult.No:
                        goto DoTheHardwareConnection;

                    default:
                    case MessageBoxResult.Cancel:
                        Functions.Shutdown();
                        break;
                }
            }

            /////////////////////////////////////////////////////////////////////////////////

            if (onlineStartup)
            {
                Dispatcher.Invoke(new Action(() => {
                    LoadingProgressBar.Value = 90;
                    LoadingProgressTB.Text = "Downloading hardware catalog...";
                }));
                await Task.Run(new Action(() => Thread.Sleep(500)));

            }
            
            /////////////////////////////////////////////////////////////////////////////////

            Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 100;
                LoadingProgressTB.Text = "Starting up...";
            }));
            await Task.Run(new Action(() => Thread.Sleep(1000)));

            ExitArg = true;
            Dispatcher.Invoke(new Action(() => {
                new Main().Show();
                Close();
            }));
        }

        private void Update(string param)
        {
            Dclient.DownloadFileAsync(new Uri(App.ServerPath + "/cp/NutriDrippCP_B" + param), DLocation);
            Application.Current.Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = 0;
                LoadingProgressTB.Text = "Downloading software update...";
            }));
        }

        private void Dclient_DownloadProgressChanged(object sender, DownloadProgressChangedEventArgs e)
        {
            double bytesIn = double.Parse(e.BytesReceived.ToString());
            double totalBytes = double.Parse(e.TotalBytesToReceive.ToString());
            double percentage = ((bytesIn / totalBytes) * 100);
            int castedPercentage = int.Parse(Math.Truncate(percentage).ToString());
            Application.Current.Dispatcher.Invoke(new Action(() => {
                LoadingProgressBar.Value = castedPercentage;
                LoadingProgressTB.Text = $"Downloading software update... ({castedPercentage}%)";
            }));
        }

        private void Dclient_DownloadFileCompleted(object sender, AsyncCompletedEventArgs e)
        {
            try
            {
                Dispatcher.Invoke(new Action(() => {
                    LoadingProgressBar.Value = 100;
                    LoadingProgressTB.Text = "Installing software update...";
                }));

                Process.Start(DLocation);
                Functions.Shutdown();
            }
            catch
            {
                Functions.MSG("UpdateError");
                Functions.Shutdown();
            }
        }
    }
}

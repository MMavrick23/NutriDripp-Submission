using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Data.SQLite;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media.Effects;
using static NutriDripp_CP.App;

namespace NutriDripp_CP
{
    class Functions
    {
        public static MessageBoxResult MSG(string Case, string ExtraParams = "") //0x006
        {
            if (ExtraParams != "") ExtraParams = " (" + ExtraParams + ")";

            switch (Case)
            {
                case "Error":
                    return MessageBox.Show("An Error" + ExtraParams + " occured, please contact NutriDripp support for fixing your issue.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);

                case "BadAPI":
                    return MessageBox.Show("Sorry but it looks like that the operating system you are using" + ExtraParams + " is not supported, please install (" + App.MinAPIN + ") or higher then try again.", "OS Not Supported", MessageBoxButton.OK, MessageBoxImage.Exclamation);

                case "NoConnection":
                    return MessageBox.Show("Failed to connect to the internet, please check your connection and try again.", "Connection Error", MessageBoxButton.OK, MessageBoxImage.Error);

                case "NoConnectionQuery":
                    return MessageBox.Show("Failed to connect to the internet, would you like to continue offline?", "Connection Error", MessageBoxButton.YesNo, MessageBoxImage.Question);

                case "NoServer":
                    return MessageBox.Show("Failed to connect to servers due to maintainance or technical problem, please try again later or call Wave support.", "Connection Error", MessageBoxButton.OK, MessageBoxImage.Exclamation);

                case "NoServerQuery":
                    return MessageBox.Show("Failed to connect to the servers due to maintainance or technical problem, would you like to continue offline?", "Connection Error", MessageBoxButton.YesNo, MessageBoxImage.Question);

                case "UpdateError":
                    return MessageBox.Show("Software could not be updated, please contact NutriDripp support if this problem repeated for fixing your issue.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);

                default:
                    return MessageBoxResult.None;
            }
        }

        public static bool[] CheckConnection()
        {
            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            List<bool> Connection = new List<bool>();

            try
            {
                using (var client = new WebClient())
                {
                    using (client.OpenRead("http://www.example.com"))
                    {
                        Connection.Add(true);
                    }
                }
            }
            catch
            {
                Connection.Add(false);
            }

            try
            {
                using (var client = new WebClient())
                {
                    using (client.OpenRead(App.SystemPath))
                    {
                        Connection.Add(true);
                        Connection[0] = true;
                    }
                }
            }
            catch
            {
                Connection.Add(false);
            }

            return Connection.ToArray();
        }

        public static async Task UseLoadingAsync(Action Action, Window Context, bool UseLoading = true)
        {
            if (UseLoading)
            {
                try
                {
                    BackgroundWorker ActionProcessor = new BackgroundWorker();
                    Loading Loading = new Loading();

                    ActionProcessor.DoWork += async delegate
                    {
                        try
                        {
                            await Task.Run(() => Action());
                        }
                        catch { }

                        Loading.Dispose();
                    };

                    ActionProcessor.RunWorkerAsync();
                    Context.Effect = new BlurEffect { Radius = 10 };
                    Loading.ShowDialog();
                }
                catch
                {
                    MSG("Error", "0x003");
                }

                Context.Effect = new BlurEffect { Radius = 0 };
            }
            else
            {
                await Task.Run(() => Action());
            }
        }

        public static async Task<string> SendServerAsync(string URL, Dictionary<string, string> Data = null, bool Silent = false, int ServerIndex = 1, bool ShowLoading = true, int Retrys = 3, int RetryCooldown = 100)
        {
            int Trys = Retrys;
        Looper:

            try
            {
                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                using (var Client = new WebClient())
                {
                    var postData = new NameValueCollection();

                    string _URL = URL;

                    switch (ServerIndex)
                    {
                        case 0:
                            _URL = App.APIsPath + "/" + URL;
                            break;

                        case 1:
                            _URL = App.SystemPath + "/" + URL;
                            break;

                        case -1:
                            _URL = URL;
                            break;

                        default:
                            if (!Silent) MSG("Error", "0x002");
                            return "IErr";
                    }

                    if (Data != null)
                    {
                        foreach (KeyValuePair<string, string> Param in Data)
                        {
                            postData[Param.Key] = Param.Value;
                        }
                    }

                    string responseFromServer = null;
                    await UseLoadingAsync(() => {
                        try
                        {
                            var response = Client.UploadValues(_URL, "POST", postData);
                            responseFromServer = Encoding.UTF8.GetString(response);
                        } catch
                        {
                            responseFromServer = "IErr";
                        }
                    }, Main.WMain, ShowLoading);

                    responseFromServer = responseFromServer.Replace("<br>", Environment.NewLine);
                    return responseFromServer;
                }
            }
            catch
            {
                if (Trys < 1)
                {
                    if (!Silent)
                    {
                        MSG("Error", "0x001");
                    }
                }
                else
                {
                    Trys--;
                    Thread.Sleep(RetryCooldown);
                    goto Looper;
                }
            }

            return "IErr";
        }

        public static dynamic SQL(string sql, SQLType type = SQLType.Query, string database = "NutriDripp.db", string password = null)
        {
            using (SQLiteConnection DBLink = new SQLiteConnection($"Data Source={database};Version=3;FailIfMissing=True;" + (!string.IsNullOrEmpty(password) ? $"Password={password};" : "")))
            {
                DBLink.Open();

                SQLiteCommand Query = new SQLiteCommand(sql, DBLink);
                switch (type)
                {
                    case SQLType.Query:
                        List<Dictionary<string, dynamic>> Records = new List<Dictionary<string, dynamic>>();

                        try
                        {
                            SQLiteDataReader QueryReader = Query.ExecuteReader();
                            if (QueryReader.HasRows)
                            {
                                while (QueryReader.Read())
                                {
                                    Dictionary<string, dynamic> Record = new Dictionary<string, dynamic>();

                                    for (int i = 0; i < QueryReader.FieldCount; i++)
                                    {
                                        Record.Add(QueryReader.GetName(i), (dynamic)QueryReader.GetValue(i));
                                    }

                                    Records.Add(Record);
                                }
                            }
                        } catch { }

                        return Records.ToArray();

                    case SQLType.BooleanOrder:
                        try
                        {
                            Query.ExecuteNonQuery();
                            return true;
                        } catch { }

                        break;

                    case SQLType.InsertedOrder:
                        try
                        {
                            return Query.ExecuteScalar();
                        }
                        catch { }

                        break;

                    case SQLType.AffectedOrder:
                        try
                        {
                            return Query.ExecuteNonQuery();
                        }
                        catch { }

                        break;

                    default:
                        break;
                }
            }

            return false;
        }

        ////////////////////////////////////////////////////////////////////////////////////////

        public static DateTime TimestampToDateTime(uint unixTimeStamp)
        {
            DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddSeconds(unixTimeStamp).ToLocalTime();
            return dtDateTime;
        }

        public static uint DateTimeToTimestamp(DateTime value)
        {
            long epoch = (value.ToUniversalTime().Ticks - 621355968000000000) / 10000000;
            return (uint)epoch;
        }

        public static string RandomString(int length = 8, string charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890")
        {
            Random random = new Random();
            return new string(Enumerable.Repeat(charset, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public static bool RemoveTemp()
        {
            try
            {
                Directory.Delete(App.Temp, true);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static string CreateTemp()
        {
            string Folder = Path.Combine(Path.GetTempPath().ToString(), Guid.NewGuid().ToString());
            while (Directory.Exists(Folder) || File.Exists(Folder))
            {
                Folder = Path.Combine(Path.GetTempPath().ToString(), Guid.NewGuid().ToString());
            }

            Directory.CreateDirectory(Folder);
            return Folder;
        }

        public static void RestartApp()
        {
            Process.Start(Application.ResourceAssembly.Location);
            Shutdown();
        }

        public static void Shutdown()
        {
            RemoveTemp();
            Application.Current.Dispatcher.Invoke(new Action(() => {
                Process.GetProcessById(Process.GetCurrentProcess().Id).Kill();
            }));
        }
    }
}

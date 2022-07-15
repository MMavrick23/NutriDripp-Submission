using System.ComponentModel;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace NutriDripp_CP
{
    public partial class Main : Window
    {
        public static Window WMain;

        public static bool ExitArg = false;
        public static bool RunBackThreads = true;
        
        BackgroundWorker HardwarePoller;

        public static bool RunBackend = false;
        BackgroundWorker Backender;

        public Main()
        {
            InitializeComponent();
            MotherShipDataZone.DataContext = App.Mothership;
            DevicesList.ItemsSource = App.Mothership.Devices;

            WMain = this;
            HardwarePoller = new BackgroundWorker();
            Backender = new BackgroundWorker();

            HardwarePoller.DoWork += HardwarePoller_DoWork;
            Backender.DoWork += Backender_DoWork;

            HardwarePoller.RunWorkerAsync();
        }

        private async void HardwarePoller_DoWork(object sender, DoWorkEventArgs e)
        {
            while (!ExitArg)
            {
                if (RunBackThreads)
                {
                    await App.Mothership.RequestHeartbeatDataAsync();
                }

                Thread.Sleep(1000);
            }
        }

        private void Backender_DoWork(object sender, DoWorkEventArgs e)
        {
            
        }

        private void RestartBtn_Click(object sender, RoutedEventArgs e)
        {
            MessageBoxResult dlg = MessageBox.Show("Are you sure you want to reset the entire system?", "Confirm Reset", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (dlg == MessageBoxResult.Yes) Functions.RestartApp();
        }

        private async void ReconnectBtn_Click(object sender, RoutedEventArgs e)
        {
            if (!await App.Mothership.ReConnectAsync()) ;
                /////Error Here/////
        }

        private async void InitializeBtn_Click(object sender, RoutedEventArgs e)
        {
            if (!await App.Mothership.InitializeAsync());
                /////Error Here/////
        }
    }
}

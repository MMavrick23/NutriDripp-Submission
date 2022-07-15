using NutriDripp_CP.Entities;
using System.Windows.Controls;

namespace NutriDripp_CP.Components
{
    public partial class DeviceItem : UserControl
    {
        public DeviceItem()
        {
            InitializeComponent();
        }

        private void RestartBtn_Click(object sender, System.Windows.RoutedEventArgs e)
        {

        }

        private async void InitializeBtn_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (DataContext.GetType() == typeof(HardwareModule))
            {
                HardwareModule currentModule = (HardwareModule)DataContext;
                if (!await App.Mothership.InitializeAsync(currentModule));
                    /////Error Here/////
            }
        }

        private async void InitializeNoCheckBtn_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (DataContext.GetType() == typeof(HardwareModule))
            {
                HardwareModule currentModule = (HardwareModule)DataContext;
                if (!await App.Mothership.InitializeAsync(currentModule, false));
                /////Error Here/////
            }
        }
    }
}

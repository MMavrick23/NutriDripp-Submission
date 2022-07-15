using System;
using System.Windows;

namespace NutriDripp_CP
{
    public partial class Loading : Window, IDisposable
    {
        public Loading()
        {
            InitializeComponent();
        }

        public void Dispose()
        {
            Dispatcher.Invoke(new Action(() => { Close(); }));
        }
    }
}

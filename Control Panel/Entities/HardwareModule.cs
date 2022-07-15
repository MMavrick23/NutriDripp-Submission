using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using static NutriDripp_CP.Entities.HardwareModuleModel;

namespace NutriDripp_CP.Entities
{
    public class HardwareModule : INotifyPropertyChanged
    {
        public enum ModuleStatus
        {
            Disconnected = -3,
            Halt = -2,
            Busy = -1,
            Lazy = 0,
            Booted = 1,
            Initialized = 2
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        public int ID { get; set; }

        private string _Name { get; set; }
        public string Name {
            get { return _Name; }
            set
            {
                _Name = value;
                PropertyChangedNotifier();
            }
        }

        private string _Version { get; set; }
        public string Version
        {
            get { return _Version; }
            set
            {
                _Version = value;
                PropertyChangedNotifier();
            }
        }

        private int _Build { get;  set; }
        public int Build
        {
            get { return _Build; }
            set
            {
                _Build = value;
                PropertyChangedNotifier();
            }
        }

        private string _Serial { get; set; }
        public string Serial
        {
            get { return _Serial; }
            set
            {
                _Serial = value;
                PropertyChangedNotifier();
            }
        }

        private ModuleType _Type { get; set; }
        public ModuleType Type
        {
            get { return _Type; }
            set
            {
                _Type = value;
                PropertyChangedNotifier();
            }
        }

        private HardwareModuleModel _Model { get; set; }
        public HardwareModuleModel Model
        {
            get { return _Model; }
            set
            {
                _Model = value;
                PropertyChangedNotifier();
            }
        }

        private ModuleStatus _Status { get; set; }
        public ModuleStatus Status
        {
            get { return _Status; }
            set
            {
                _Status = value;
                PropertyChangedNotifier();
            }
        }

        public ObservableCollection<HardwareModuleError> Errors { get; set; }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        public HardwareModule()
        {
            Errors = new ObservableCollection<HardwareModuleError>();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public event PropertyChangedEventHandler PropertyChanged;
        public void PropertyChangedNotifier([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

            if (propertyName == "AllTaxReports")
                PropertyChangedNotifier("IsIssueExists");
        }
    }
}

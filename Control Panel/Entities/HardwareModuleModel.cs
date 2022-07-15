using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace NutriDripp_CP.Entities
{
    public class HardwareModuleModel : INotifyPropertyChanged
    {
        public enum ModuleType
        {
            Controller = 0,
            Mixer = 1,
            Dispense = 2,
            Soil = 3
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public readonly int ID;

        private string _Name { get; set; }
        public string Name
        {
            get { return _Name; }
            private set
            {
                _Name = value;
                PropertyChangedNotifier();
            }
        }

        private ModuleType _Type { get; set; }
        public ModuleType Type
        {
            get { return _Type; }
            private set
            {
                _Type = value;
                PropertyChangedNotifier();
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        public HardwareModuleModel(int id)
        {
            ID = id;
            UpdateData();
        }

        public void UpdateData()
        {
            try
            {
                List<Dictionary<string, dynamic>> rawDataBaseResponse = Functions.SQL($"SELECT * FROM DeviceModel WHERE ID = {ID};");
                if (rawDataBaseResponse.Count > 0)
                {
                    Dictionary<string, dynamic> parsedData = rawDataBaseResponse[0];

                    Name = (string)parsedData["Name"];
                    Type = (ModuleType)(int)parsedData["Type"];
                }
            }
            catch
            {
                /////Error Here/////
            }
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

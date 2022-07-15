using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace NutriDripp_CP.Entities
{
    public class HardwareModuleError : INotifyPropertyChanged
    {
        public int ID { get; private set; }

        private int _Code { get; set; }
        public int Code
        {
            get { return _Code; }
            set
            {
                _Code = value;
                UpdateData();
                PropertyChangedNotifier();
            }
        }

        private string _Title { get; set; }
        public string Title
        {
            get { return _Title; }
            private set
            {
                _Title = value;
                PropertyChangedNotifier();
            }
        }

        private string _Caption { get; set; }
        public string Caption
        {
            get { return _Caption; }
            private set
            {
                _Caption = value;
                PropertyChangedNotifier();
            }
        }

        private bool _Severity { get; set; }
        public bool Severity
        {
            get { return _Severity; }
            private set
            {
                _Severity = value;
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
                UpdateData();
                PropertyChangedNotifier();
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public HardwareModuleError(int code, HardwareModuleModel model)
        {
            Code = code;
            Model = model;
            Severity = false;

            UpdateData();
        }

        public void UpdateData()
        {
            try
            {
                if (ID > 0 || Model != null)
                {
                    List<Dictionary<string, dynamic>> rawDataBaseResponse = Functions.SQL("SELECT * FROM DeviceModel WHERE" + (ID > 0 ? $"ID = {ID}" : $"Code = {Code} AND Model = {Model.ID}") + ";");
                    if (rawDataBaseResponse.Count > 0)
                    {
                        Dictionary<string, dynamic> parsedData = rawDataBaseResponse[0];

                        ID = (int)parsedData["ID"];
                        Title = (string)parsedData["Title"];
                        Caption = (string)parsedData["Caption"];
                        Severity = (bool)parsedData["Severity"];
                    }
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

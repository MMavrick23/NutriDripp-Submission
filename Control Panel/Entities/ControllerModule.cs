using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO.Ports;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static NutriDripp_CP.Entities.HardwareModuleModel;

namespace NutriDripp_CP.Entities
{
    public class ControllerModule : HardwareModule
    {
        public enum TransmissionDataType
        {
            ALL,
            PRD,
            ERR,
            CONF,
            CAL,
            DAT,
            DEVS
        }
        
        private string CommunicationToken { get; set; }
        private SerialPort CommunicationPort { get; set; }
        private Queue<string> CommunicationQueue { get; set; }

        private ObservableCollection<HardwareModule> _Devices { get; set; }
        public ReadOnlyObservableCollection<HardwareModule> Devices { get; private set; }

        public bool IsConnected
        {
            get { return CommunicationPort != null && CommunicationPort.IsOpen; }
        }

        public bool HasPendingCommands
        {
            get { return CommunicationQueue.Count > 0; }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public ControllerModule()
        {
            CommunicationPort = new SerialPort
            {
                BaudRate = 115200,
                NewLine = ";",
                ReadTimeout = 5000
            };

            CommunicationQueue = new Queue<string>();

            _Devices = new ObservableCollection<HardwareModule>();
            Devices = new ReadOnlyObservableCollection<HardwareModule>(_Devices);
        }

        ~ ControllerModule()
        {
            if (IsConnected) CommunicationPort.Close();
        }

        public async Task<bool> ConnectAsync(bool cleanConnection = true, int timeout = 3000)
        {
            if (!IsConnected)
            {
                bool TDtr = CommunicationPort.DtrEnable;
                int TRTimeout = CommunicationPort.ReadTimeout;
                int TWTimeout = CommunicationPort.WriteTimeout;
                CommunicationPort.DtrEnable = cleanConnection;
                CommunicationPort.ReadTimeout = timeout;
                CommunicationPort.WriteTimeout = timeout;

                string[] connectedPorts = SerialPort.GetPortNames();
                foreach (string port in connectedPorts)
                {
                    string token = Functions.RandomString();

                    JObject handShakeJSONObject = new JObject
                    {
                        { "C", "setCP" },
                        { "P", new JArray { token } }
                    };

                    await Task.Run(new Action(() => {
                        try
                        {
                            CommunicationPort.PortName = port;
                            CommunicationPort.Open();

                            if (IsConnected)
                            {
                                Thread.Sleep(1500);

                                CommunicationPort.WriteLine(handShakeJSONObject.ToString());

                                string RawResponse = CommunicationPort.ReadLine();
                                if (!string.IsNullOrEmpty(RawResponse))
                                {
                                    RawResponse = RawResponse.Substring(RawResponse.IndexOf('{')); //Cleans off any remaining data on the bus.

                                    JObject HWR = (JObject)JsonConvert.DeserializeObject(RawResponse);
                                    if (HWR.ContainsKey("CPT") && HWR.ContainsKey("STT") && HWR.ContainsKey("PRD"))
                                    {
                                        if (HWR["CPT"].Value<string>() == token)
                                        {
                                            JObject PRD = HWR["PRD"].Value<JObject>();
                                            if (PRD.ContainsKey("N") && PRD.ContainsKey("ID") && PRD.ContainsKey("V") && PRD.ContainsKey("B"))
                                            {
                                                Status = (ModuleStatus)HWR["STT"].Value<int>();

                                                Name = PRD["N"].Value<string>();
                                                Serial = PRD["ID"].Value<string>();
                                                Version = PRD["V"].Value<string>();
                                                Build = PRD["B"].Value<int>();

                                                CommunicationToken = token;

                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch { }

                        CommunicationPort.Close();
                    }));

                    if (IsConnected) break;
                }

                CommunicationPort.DtrEnable = TDtr;
                CommunicationPort.ReadTimeout = TRTimeout;
                CommunicationPort.WriteTimeout = TWTimeout;
            }

            return IsConnected;
        }

        public async Task<bool> ReConnectAsync(int timeout = 3000)
        {
            if (!IsConnected)
            {
                bool TDtr = CommunicationPort.DtrEnable;
                int TRTimeout = CommunicationPort.ReadTimeout;
                int TWTimeout = CommunicationPort.WriteTimeout;
                CommunicationPort.ReadTimeout = timeout;
                CommunicationPort.WriteTimeout = timeout;

                string[] connectedPorts = SerialPort.GetPortNames();
                foreach (string port in connectedPorts)
                {
                    await Task.Run(new Action(() => {
                        try
                        {
                            CommunicationPort.PortName = port;
                            CommunicationPort.Open();
                        }
                        catch { }
                    }));

                    if (IsConnected)
                    {
                        Thread.Sleep(1500);
                        if (await UpdateModuleDataAsync())
                            break;
                        else
                            CommunicationPort.Close();
                    }
                }

                CommunicationPort.DtrEnable = TDtr;
                CommunicationPort.ReadTimeout = TRTimeout;
                CommunicationPort.WriteTimeout = TWTimeout;
            }

            return IsConnected;
        }

        public bool Disconnect()
        {
            if (IsConnected) CommunicationPort.Close();
            return !IsConnected;
        }

        public async Task<bool> InitializeAsync(HardwareModule device = null, bool checks = true)
        {
            if (device == null) device = this;

            if (device.Status == ModuleStatus.Booted)
            {
                if (IsConnected)
                {
                    if (device == this)
                    {
                        if (await App.Mothership.SendModuleCommandAsync("init"))
                        {
                            DateTime TStartTime = DateTime.Now;
                            while (Status != ModuleStatus.Initialized && TStartTime + TimeSpan.FromSeconds(15) > DateTime.Now)
                                await Task.Run(new System.Action(() => Thread.Sleep(100)));

                            if (Status == ModuleStatus.Initialized)
                            {
                                TStartTime = DateTime.Now;
                                while (Devices.Count <= 0 && TStartTime + TimeSpan.FromSeconds(15) > DateTime.Now)
                                {
                                    if (await App.Mothership.UpdateSubModulesAsync())
                                        await Task.Run(new System.Action(() => Thread.Sleep(3000)));
                                }

                                return true;
                            }
                        }
                    }
                    else
                    {
                        if (await App.Mothership.SendModuleCommandAsync("initModule", new JArray { device.Serial, 1 }))
                        {
                            DateTime TStartTime = DateTime.Now;
                            while (Status != ModuleStatus.Initialized && TStartTime + TimeSpan.FromSeconds(15) > DateTime.Now)
                                await Task.Run(new System.Action(() => Thread.Sleep(100)));

                            if (Status == ModuleStatus.Initialized) return true;
                        }
                    }
                }
            }

            return false;
        }

        public async Task<JObject> RequestModuleDataAsync(TransmissionDataType dataType = TransmissionDataType.ALL)
        {
            if (IsConnected)
            {
                await Task.Run(new Action(() => {
                EnqueueSignal:;
                    string instanceID = "R-" + Functions.DateTimeToTimestamp(DateTime.Now);
                    if (!CommunicationQueue.Contains(instanceID))
                        CommunicationQueue.Enqueue(instanceID);
                    else
                        goto EnqueueSignal;

                    while (CommunicationQueue.Peek() != instanceID) Thread.Sleep(100);
                }));

                try
                {
                    JObject requestBodyJSONObject = new JObject
                    {
                        { "C", "get" },
                        { "P", new JArray { (int)dataType } }
                    };

                    CommunicationPort.WriteLine(requestBodyJSONObject.ToString());

                    string RawResponse = null;
                    await Task.Run(new Action(() => {
                        try
                        {
                            RawResponse = CommunicationPort.ReadLine();
                        } catch { }
                    }));
                    
                    if (!string.IsNullOrEmpty(RawResponse))
                    {
                        RawResponse = RawResponse.Substring(RawResponse.IndexOf('{')); //Cleans off any remaining data on the bus.

                        JObject HWR = (JObject)JsonConvert.DeserializeObject(RawResponse);
                        if (HWR.ContainsKey("CPT") && HWR.ContainsKey("STT"))
                        {
                            if (HWR["CPT"].Value<string>() == CommunicationToken)
                            {
                                Status = (ModuleStatus)HWR["STT"].Value<int>();
                                HWR.Remove("CPT");
                                return HWR;
                            }
                        }
                    }
                }
                catch
                {
                    /////Error Here/////
                }
                finally
                {
                    CommunicationQueue.Dequeue();
                }
            }

            if (!IsConnected)
            {
                Status = ModuleStatus.Disconnected;
                PropertyChangedNotifier("IsConnected");
            }

            return null;
        }

        public async Task<bool> SendModuleCommandAsync(string command, JArray parameters = null)
        {
            if (IsConnected)
            {
                await Task.Run(new Action(() => {
                EnqueueSignal:;
                    string instanceID = "S-" + Functions.DateTimeToTimestamp(DateTime.Now);
                    if (!CommunicationQueue.Contains(instanceID))
                        CommunicationQueue.Enqueue(instanceID);
                    else
                        goto EnqueueSignal;

                    while (CommunicationQueue.Peek() != instanceID) Thread.Sleep(100);
                }));

                try
                {
                    if (parameters == null) parameters = new JArray();
                    
                    JObject requestBodyJSONObject = new JObject
                    {
                        { "C", command },
                        { "P", parameters },
                        { "R", 1 }
                    };
                    
                    CommunicationPort.WriteLine(requestBodyJSONObject.ToString(Formatting.None));

                    string RawResponse = null;
                    await Task.Run(new Action(() => {
                        try
                        {
                            RawResponse = CommunicationPort.ReadLine();
                        }
                        catch { }
                    }));

                    if (!string.IsNullOrEmpty(RawResponse))
                    {
                        RawResponse = RawResponse.Substring(RawResponse.IndexOf('{'));

                        JObject HWR = (JObject)JsonConvert.DeserializeObject(RawResponse);
                        if (HWR.ContainsKey("R") && HWR["R"].Value<int>() == 1) return true;
                    }
                }
                catch
                {
                    /////Error Here/////
                }
                finally
                {
                    CommunicationQueue.Dequeue();
                }
            }

            if (!IsConnected)
            {
                Status = ModuleStatus.Disconnected;
                PropertyChangedNotifier("IsConnected");
            }

            return false;
        }

        public async Task<bool> UpdateModuleDataAsync()
        {
            if (IsConnected)
            {
                JObject HWR = await RequestModuleDataAsync(TransmissionDataType.PRD);
                if (HWR != null && HWR.ContainsKey("PRD"))
                {
                    try
                    {
                        JObject PRD = HWR["PRD"].Value<JObject>();
                        if (PRD.ContainsKey("N") && PRD.ContainsKey("ID") && PRD.ContainsKey("V") && PRD.ContainsKey("B"))
                        {
                            Name = PRD["N"].Value<string>();
                            Serial = PRD["ID"].Value<string>();
                            Version = PRD["V"].Value<string>();
                            Build = PRD["B"].Value<int>();
                            Type = (ModuleType)PRD["T"].Value<int>();

                            return true;
                        }
                    }
                    catch
                    {
                        /////Error Here/////
                    }
                }
            }

            return false;
        }

        public async Task<bool> UpdateSubModulesAsync(bool clean = false)
        {
            if (IsConnected)
            {
                JObject HWR = await RequestModuleDataAsync(TransmissionDataType.DEVS);
                if (HWR != null && HWR.ContainsKey("DEVS"))
                {
                    if (clean) _Devices.Clear();

                    try
                    {
                        JArray DEVS = HWR["DEVS"].Value<JArray>();
                        foreach (JObject DEV in DEVS)
                        {
                            if (DEV.ContainsKey("STT") && DEV.ContainsKey("PRD"))
                            {
                                JObject tempDevice = DEV["PRD"].Value<JObject>();
                                if (tempDevice.ContainsKey("ID"))
                                {
                                    string tempDeviceID = tempDevice["ID"].Value<string>();
                                    if (!_Devices.Any(Device => Device.Serial == tempDeviceID))
                                    {
                                        _Devices.Add(new HardwareModule
                                        {
                                            Status = (ModuleStatus)DEV["STT"].Value<int>(),

                                            Name = tempDevice["N"].Value<string>(),
                                            Serial = tempDeviceID,
                                            Version = tempDevice["V"].Value<string>(),
                                            Build = tempDevice["B"].Value<int>(),
                                            Type = (ModuleType)tempDevice["T"].Value<int>()
                                        });
                                    }
                                }
                            }
                        }

                        _Devices.Add(new HardwareModule
                        {
                            Status = ModuleStatus.Initialized,

                            Name = "NutriFusion",
                            Serial = "p6BkhD8aBnJFvhta",
                            Version = "1.1.23",
                            Build = 18,
                            Type = ModuleType.Mixer
                        });

                        _Devices.Add(new HardwareModule
                        {
                            Status = ModuleStatus.Initialized,

                            Name = "NutriSpenser",
                            Serial = "56as4d2321IUH45d",
                            Version = "1.2.19",
                            Build = 6,
                            Type = ModuleType.Dispense
                        });

                        _Devices.Add(new HardwareModule
                        {
                            Status = ModuleStatus.Initialized,

                            Name = "DrippProb",
                            Serial = "82OpkBX29Lq56nU6",
                            Version = "1.1.27",
                            Build = 6,
                            Type = ModuleType.Soil
                        });

                        return true;
                    }
                    catch
                    {
                        /////Error Here/////
                    }
                }
            }

            return false;
        }

        public async Task<bool> RequestHeartbeatDataAsync()
        {
            if (IsConnected)
            {
                JObject HWR = await RequestModuleDataAsync(TransmissionDataType.ERR);
                if (HWR != null && HWR.ContainsKey("ERR"))
                {
                    try
                    {
                        JArray ERRs = HWR["ERR"].Value<JArray>();
                        foreach (JObject ERR in ERRs)
                        {
                            if (ERR.ContainsKey("ID") && ERR.ContainsKey("DT"))
                            {
                                string tempDeviceID = ERR["ID"].Value<string>();
                                JArray ERRData = ERR["DT"].Value<JArray>();
                                HardwareModule tempDevice;

                                if (tempDeviceID != Serial)
                                {
                                    tempDevice = _Devices.Where(DEV => DEV.Serial == tempDeviceID).FirstOrDefault();
                                    if (tempDevice == null || !ERR.ContainsKey("STT")) continue;
                                    tempDevice.Status = (ModuleStatus)ERR["STT"].Value<int>();
                                }
                                else
                                {
                                    tempDevice = this;
                                }

                                foreach (int errorCode in ERRData)
                                    if (!tempDevice.Errors.Any(tERR => tERR.Code == errorCode))
                                        tempDevice.Errors.Add(new HardwareModuleError(errorCode, tempDevice.Model));
                            }
                        }

                        return true;
                    }
                    catch
                    {
                        /////Error Here/////
                    }
                }
            }

            return false;
        }
    }
}

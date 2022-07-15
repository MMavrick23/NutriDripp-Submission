using NutriDripp_CP.Entities;
using System;
using System.IO;
using System.Windows;

namespace NutriDripp_CP
{
    public partial class App : Application
    {
        public enum SQLType
        {
            Query = 0,
            BooleanOrder = 1,
            InsertedOrder = 2,
            AffectedOrder = 3
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public static readonly string ServerPath = "https://nutridripp.com";
        public static readonly string APIsPath = ServerPath + "/APIs";
        public static readonly string SystemPath = APIsPath + "/Beta";

        public static readonly string MinAPIN = "Windows OS 8.1";
        public static readonly double MinAPIV = 6.2;

        public static readonly int Build = 1;
        public static readonly string Version = "0.0.0";

        public static string Temp = Functions.CreateTemp();
        public static string DataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "NutriDripp");
        
        public static bool IsOnline
        {
            get
            {
                bool[] Connection = Functions.CheckConnection();
                return Connection[0] && Connection[1];
            }
        }

        public static ControllerModule Mothership;
    }
}

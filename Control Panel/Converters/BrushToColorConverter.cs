using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace NutriDripp_CP.Converters
{
    internal class BrushToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value != null)
                return ((SolidColorBrush)(Brush)value).Color;

            return value;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}

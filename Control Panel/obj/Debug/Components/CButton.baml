   M S B A M L   `   `   `  ����H  DNutriDripp-CP, Version=1.0.0.0, Culture=neutral, PublicKeyToken=nullC&clr-namespace:NutriDripp_CP.ComponentsNutriDripp_CP.Components  5      &     NutriDripp_CP.Components.CButton   5   	   \ XPresentationFramework, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35R NWindowsBase, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35W SPresentationCore, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35D 9http://schemas.microsoft.com/winfx/2006/xaml/presentation    5      R NSystem.Xaml, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5      Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5      @d2http://schemas.microsoft.com/expression/blend/2008     5      8local&clr-namespace:NutriDripp_CP.Components     5      ��5
      �� 5   
     �� 
TargetType"  ��6   .�5      ��  �� Property � �� �� Value 5      �� 5       �� 
TargetType" ��6&   .R�5      �� #��z��6!    �� Padding# z��6q   #��z��6�   #��z��6�    �� CornerRadius 6K   �� *CornerRadius+ � Triggers 5      :� 5   "    :� RoutedEvent$ Button.MouseEnter��6/   .[�5   &   �� .��5   *   �� .��5   .   ��  g� Duration$ 0:0:0.25D�6=   	 �� TargetProperty$	 Background.Color�6�   
 g� FillBehavior$
 HoldEnd=�6�   	 �� To 6Q   �� *
HoverColor+   BrushToColor �� 	Converter# [  6�   5   +   5   '   5   #   :� 5   "   $ Button.MouseLeave��6/   .[�5   &   �� .��5   *   �� .��5   .   �� $ 0:0:0.25D�6=   $	 Background.Color�6�   $

 Stop=�6�    6Q   �� *
Background+# [  6�   5   +   5   '   5   #   ._�5"      �� #��z��6/   #��z��6r   5#      5$      5&      5'      5)      
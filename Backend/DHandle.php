<?php
require '../_Functions';

$Function = $_POST["Func"];
$Response["ReturnCode"] = -1000;

switch ($Function) {
  case '0':
    /////Link Device to Farm/////
    $DLCID = SQLSafe($_POST["DLCID"]);
    $FLCID = SQLSafe($_POST["FLCID"]);
    $FPass = SQLSafe($_POST["FPass"]);

    $Devices = SQL("SELECT ID FROM Device WHERE LCID = '$DLCID';");
    if ($Devices != 0 && count($Devices) > 0) {
      $DID = $Devices[0]["ID"];

      $Farms = SQL("SELECT ID, Password, Active FROM Farm WHERE LCID = '$FLCID';");
      if ($Farms != 0 && count($Farms) > 0) {
        $Farm = $Farms[0];
        $FID = $Farm["ID"];

        if (hash("sha256", $FPass) == $Farm["Password"]) {
          if ($Farm["Active"] > 0) {
            SQL("UPDATE Device SET Farm = NULL WHERE Farm = $FID;", 1);
            SQL("UPDATE Farm SET MainDevice = NULL WHERE MainDevice = $DID;", 1);

            if (SQL("UPDATE Device SET Farm = $FID WHERE ID = $DID;", 1)) {
              if (SQL("UPDATE Farm SET MainDevice = $DID WHERE ID = $FID;", 1)) {
                $Response["ReturnCode"] = 1;
              }
            }
          } else {
            ///Farm was suspended
            $Response["ReturnCode"] = -3;
          }
        } else {
          ///Wrong farm password
          $Response["ReturnCode"] = -1;
        }
      } else {
        ///Wrong farm LCID
        $Response["ReturnCode"] = -1;
      }
    } else {
      ///Device does not exist (Impossible)
      $Response["ReturnCode"] = -2;
    }
    break;

  default:
    /////Failure Procedure/////
    $Response["ReturnCode"] = -999;
    break;
}

echo json_encode($Response);
exit();
?>

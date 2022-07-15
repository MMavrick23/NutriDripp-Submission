<?php
require '../_Functions';

$Function = $_POST["Func"];
$Response["ReturnCode"] = -1000;

switch ($Function) {
  case '0':
    /////List Farms/////
    if (($UID = GetVerifyUser()) !== false) {
      $Farms = SQL("SELECT ID, Name, Preset, Timezone, Size, Favorite FROM Farm WHERE User = $UID AND Active = 1;");
      if ($Farms == 0) {
        $Farms = array();
      } else if (count($Farms) > 0) {
        for ($i=0; $i < count($Farms); $i++) {
          $FID = $Farms[$i]["ID"];

          $Attributes = SQL("SELECT ID, Attribute.PKey, Value, Attribute.Unit, Value FROM FarmAttribute WHERE Farm = $FID AND Attribute.Write = 0;");
          if ($Attributes == 0) $Attributes = array();

          $Farms[$i]["Attributes"] = $Attributes;
        }
      }

      $Response["Payload"] = $Farms;
      $Response["ReturnCode"] = 1;
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '1':
    /////Create New Farm/////
    if (!isset($_POST["Name"]) || empty($_POST["Name"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Name";
      break;
    }

    if (!isset($_POST["Pass"]) || empty($_POST["Pass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Pass";
      break;
    }

    if (!isset($_POST["Size"]) || empty($_POST["Size"]) || !ValText($_POST["Size"], "NUM", ".")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Size";
      break;
    }

    if (!isset($_POST["Timezone"]) || empty($_POST["Timezone"]) || !ValText($_POST["Timezone"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Timezone";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $Name = trim(SQLSafe($_POST["Name"]));
    $Pass = SQLSafe($_POST["Pass"]);
    $Size = floatval(SQLSafe($_POST["Size"]));
    $Timezone = intval(SQLSafe($_POST["Timezone"]));

    //////////////////////////////////////////////////////////////////

    if (strlen($Pass) < 8) {
      $Response["ReturnCode"] = -3;
      break;
    }

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      $HashedPass = hash("sha256", $Pass);

GenerateLCID:
      $LCID = RandString(16);

      if ($ID = SQL("INSERT INTO Farm (LCID, User, Name, Password, Timezone, Size, Timestamp)  VALUES ('$LCID', $UID, '$Name', '$HashedPass', $Timezone, $Size, $Now);", 2)) {
        $Response["Payload"] = $ID;
        $Response["ReturnCode"] = 1;
      } else {
        $LCIDs = SQL("SELECT ID FROM Farm WHERE LCID = '$LCID';");
        if ($LCIDs != 0 && count($LCIDs) > 0) goto GenerateLCID;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '2':
    /////Delete Farm/////
    if (!isset($_POST["ID"]) || empty($_POST["ID"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "ID";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $ID = SQLSafe($_POST["ID"]);

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      if (GetConfirmUserPass($UID)) {
        if (SQL("DELETE FROM Farm WHERE User = $UID AND ID = $ID", 3) > 0) {
          $Response["ReturnCode"] = 1;
        } else {
          $Response["ReturnCode"] = -4;
        }
      } else {
        $Response["ReturnCode"] = -3;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '3':
    /////Edit Farm/////
    if (!isset($_POST["ID"]) || empty($_POST["ID"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "ID";
      break;
    }

    if (!isset($_POST["Name"]) || empty($_POST["Name"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Name";
      break;
    }

    if (!isset($_POST["Size"]) || empty($_POST["Size"]) || !ValText($_POST["Size"], "NUM", ".")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Size";
      break;
    }

    if (!isset($_POST["Timezone"]) || empty($_POST["Timezone"]) || !ValText($_POST["Timezone"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Timezone";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $ID = SQLSafe($_POST["ID"]);
    $Name = trim(SQLSafe($_POST["Name"]));
    $Size = floatval(SQLSafe($_POST["Size"]));
    $Timezone = intval(SQLSafe($_POST["Timezone"]));

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      if (SQL("UPDATE Farm SET Name = '$Name', Timezone = $Timezone, Size = $Size WHERE User = $UID AND ID = $ID;", 3) > 0) {
        $Response["ReturnCode"] = 1;
      } else {
        $Response["ReturnCode"] = -3;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '4':
    /////Edit Farm Password/////
    if (!isset($_POST["ID"]) || empty($_POST["ID"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "ID";
      break;
    }

    if (!isset($_POST["Pass"]) || empty($_POST["Pass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Pass";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $ID = SQLSafe($_POST["ID"]);
    $Pass = SQLSafe($_POST["Pass"]);

    //////////////////////////////////////////////////////////////////

    if (strlen($Pass) < 8) {
      $Response["ReturnCode"] = -3;
      break;
    }

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      if (GetConfirmUserPass($UID)) {
        $HashedPass = hash("sha256", $Pass);

        if (SQL("UPDATE Farm SET Password = '$HashedPass' WHERE User = $UID AND ID = $ID;", 3) > 0) {
          $Response["ReturnCode"] = 1;
        } else {
          $Response["ReturnCode"] = -5;
        }
      } else {
        $Response["ReturnCode"] = -4;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '5':
    /////Get Detailed Farm Data/////
    if (!isset($_POST["ID"]) || empty($_POST["ID"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "ID";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $ID = SQLSafe($_POST["ID"]);

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      $Farms = SQL("SELECT ID, LCID, Name, Preset, Timezone, Size, Favorite FROM Farm WHERE User = $UID AND ID = $ID AND Active = 1;");
      if ($Farms != 0 && count($Farms) > 0) {
        $Farm = $Farms[0];
        $FID = $Farm["ID"];

        $Attributes = SQL("SELECT ID, Attribute.PKey, Value, Attribute.Unit, Attribute.Write, Value FROM FarmAttribute WHERE Farm = $FID;");
        if ($Attributes == 0) $Attributes = array();

        $Procedures = SQL("SELECT ID, Title, Parameters FROM Procedure WHERE Farm = $FID;");
        if ($Procedures == 0) $Procedures = array();

        $Farm["Attributes"] = $Attributes;
        $Farm["Procedures"] = $Procedures;

        $Response["Payload"] = $Farm;
        $Response["ReturnCode"] = 1;
      } else {
        $Response["ReturnCode"] = -3;
      }
    } else {
      $Response["ReturnCode"] = -1;
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

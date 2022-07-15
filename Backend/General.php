<?php
require '../_Functions';

$Function = $_POST["Func"];
$Response["ReturnCode"] = -1000;

switch ($Function) {
  case '0':
    /////Get All Countries/////
    $Countries = SQL("SELECT ID, Name, Code, Phone FROM Country WHERE Active = 1;");

    if ($Countries != 0 && count($Countries) > 0) {
      $Language = intval(SQLSafe($_POST["Language"]));
      if (isset($_POST["Language"]) && !empty($_POST["Language"])) {
        $Languages = SQL("SELECT ID FROM Language WHERE ID = $Language AND Active = 1;");
        if ($Languages != 0 && count($Languages) > 0) {
          for ($i=0; $i < count($Countries); $i++) {
            $CID = $Countries[$i]["ID"];

            if (($CLs = SQL("SELECT Name FROM CountryLanguage WHERE Country = $CID AND Language = $Language;")) != 0 && count($CLs) > 0) {
                $Countries[$i]["Name"] = $CLs[0]["Name"];
            }
          }
        }
      }
    } else {
      $Countries = array();
    }

    $Response["Payload"] = $Countries;
    $Response["ReturnCode"] = 1;

    break;

  case '1':
    /////Get All Languages/////
    $Languages = SQL("SELECT ID, Name, Code FROM Language WHERE Active = 1;");
    $Response["Payload"] = (($Languages != 0 && count($Languages) > 0) ? $Languages : array());
    $Response["ReturnCode"] = 1;

    break;

  case '2':
    /////Get All Genders/////
    $Genders = SQL("SELECT ID, Title FROM Gender WHERE Active = 1;");

    if ($Genders != 0 && count($Genders) > 0) {
      $Language = intval(SQLSafe($_POST["Language"]));
      if (isset($_POST["Language"]) && !empty($_POST["Language"])) {
        $Languages = SQL("SELECT ID FROM Language WHERE ID = $Language AND Active = 1;");
        if ($Languages != 0 && count($Languages) > 0) {
          for ($i=0; $i < count($Genders); $i++) {
            $GID = $Genders[$i]["ID"];

            if (($GLs = SQL("SELECT Title FROM GenderLanguage WHERE Gender = $GID AND Language = $Language;")) != 0 && count($GLs) > 0) {
                $Genders[$i]["Title"] = $GLs[0]["Title"];
            }
          }
        }
      }
    } else {
      $Genders = array();
    }

    $Response["Payload"] = $Genders;
    $Response["ReturnCode"] = 1;

    break;

  case '3':
    /////Get All Timezones/////
    $Timezones = SQL("SELECT ID, Name FROM Timezone WHERE Active = 1;");

    if ($Timezones != 0 && count($Timezones) > 0) {
      $Language = intval(SQLSafe($_POST["Language"]));
      if (isset($_POST["Language"]) && !empty($_POST["Language"])) {
        $Languages = SQL("SELECT ID FROM Language WHERE ID = $Language AND Active = 1;");
        if ($Languages != 0 && count($Languages) > 0) {
          for ($i=0; $i < count($Timezones); $i++) {
            $TID = $Timezones[$i]["ID"];

            if (($TLs = SQL("SELECT Name FROM TimezoneLanguage WHERE Timezone = $TID AND Language = $Language;")) != 0 && count($TLs) > 0) {
                $Timezones[$i]["Name"] = $TLs[0]["Name"];
            }
          }
        }
      }
    } else {
      $Timezones = array();
    }

    $Response["Payload"] = $Timezones;
    $Response["ReturnCode"] = 1;

    break;

  case '4':
    /////Get Control Panel Versioning/////
    $CP["Version"] = GetParam("ControlPanelVersion");
    $CP["Build"] = intval(GetParam("ControlPanelBuild"));

    $Response["Payload"] = $CP;
    $Response["ReturnCode"] = 1;
    break;

  default:
    /////Failure Procedure/////
    $Response["ReturnCode"] = -999;
    break;
}

echo json_encode($Response);
exit();
?>

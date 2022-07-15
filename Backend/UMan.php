<?php
require '../_Functions';

$Function = $_POST["Func"];
$Response["ReturnCode"] = -1000;

switch ($Function) {
  case '0':
    /////Login Procedure/////
    $Login = SQLSafe($_POST["Login"]);
    $Pass = SQLSafe($_POST["Pass"]);

    $Users = SQL("SELECT ID, UName, Password, Mail, Phone, Status, Attempts, LastAttempt
      FROM User WHERE (ID='$Login') OR (UName='$Login') OR (Mail != '' AND Mail='$Login') OR (Phone != '' AND Phone = '$Login') ORDER BY ID ASC;");

    if ($Users != 0 && count($Users) > 0) {
      $User = $Users[0];

      $UID = intval($User["ID"]);
      $LoginAttempts = intval($User["Attempts"]);
      $LastLoginAttempt = intval($User["LastAttempt"]);
      $UserAccountStatus = intval($User["Status"]);

      $AllowedAttempts = intval(GetParam("MaxLoginAttempts"));
      $OverLoginPenalty = intval(GetParam("OverLoginPenalty"));

      $NextLoginAttemptDelay = (2 ** ($LoginAttempts - $AllowedAttempts)) * $OverLoginPenalty;
      $NextLoginAttemptTime = $LastLoginAttempt + $NextLoginAttemptDelay;

      if (($LoginAttempts < $AllowedAttempts) || ($NextLoginAttemptTime <= $Now)) {
        if (hash("sha256", $Pass) == $User["Password"]) {
          if ($UserAccountStatus > 0) {
            if (SQL("UPDATE User SET LastSeen = $Now, Attempts = 0, LastAttempt = $Now WHERE ID = $UID;", 1)) {
              if (($Token = GenerateUserToken($UID, $Pass)) !== false) {
                $Response["Payload"] = $Token;
                $Response["ReturnCode"] = 1;
              }
            }
          } else {
            ///Account was suspended
            $Response["ReturnCode"] = -3;
          }
        } else {
          ///Wrong login details
          if (SQL("UPDATE User SET Attempts = ($LoginAttempts + 1), LastAttempt = $Now WHERE ID = $UID;", 1)) {
            $Response["ReturnCode"] = -1;
          }
        }
      } else {
        ///Too many login attempts
        $Response["ReturnCode"] = -2;
        $Response["ReturnParam"] = $NextLoginAttemptTime - $Now;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '1':
    /////Register Procedure/////
    if (!isset($_POST["FName"]) || empty($_POST["FName"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "FName";
      break;
    }

    if (!isset($_POST["LName"]) || empty($_POST["LName"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "LName";
      break;
    }

    if (!isset($_POST["UName"]) || empty($_POST["UName"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "UName";
      break;
    }

    if (!isset($_POST["Mail"]) || empty($_POST["Mail"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Mail";
      break;
    }

    if (!isset($_POST["Pass"]) || empty($_POST["Pass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Pass";
      break;
    }

    if (!isset($_POST["Gender"]) || empty($_POST["Gender"]) || !ValText($_POST["Language"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Gender";
      break;
    }

    if (!isset($_POST["Language"]) || empty($_POST["Language"]) || !ValText($_POST["Language"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Language";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $Token = SQLSafe($_POST["Token"]);
    $FName = str_replace(' ', '', ucfirst(SQLSafe($_POST["FName"])));
    $LName = str_replace(' ', '', ucfirst(SQLSafe($_POST["LName"])));
    $UName = str_replace(' ', '', SQLSafe($_POST["UName"]));
    $Mail = str_replace(' ', '', strtolower(SQLSafe($_POST["Mail"])));
    $Pass = SQLSafe($_POST["Pass"]);
    $Gender = intval(SQLSafe($_POST["Gender"]));
    $Language = intval(SQLSafe($_POST["Language"]));

    //////////////////////////////////////////////////////////////////

    $Users = SQL("SELECT UName, Mail FROM User WHERE UName = '$UName' OR Mail = '$Mail';");
    if ($Users != 0 || count($Users) > 0) {
      $User = $Users[0];
      if ($User["UName"] == $UName) {
        $Response["ReturnCode"] = -3;
        break;
      }

      if ($User["Mail"] == $Mail) {
        $Response["ReturnCode"] = -4;
        break;
      }
    }

    if (strlen($Pass) < 8) {
      $Response["ReturnCode"] = -5;
      break;
    }

    //////////////////////////////////////////////////////////////////

    if ($IP == '') $IP = $_SERVER['REMOTE_ADDR'];

    $IPData = GetIPData($IP, 16642);
    if ($IPData !== false) {
      $IPCountry = $IPData["countryCode"];
      $Countries = SQL("SELECT ID FROM Country Where Code = '$IPCountry';");
      if ($Countries != 0 && count($Countries) > 0) {
        $Country = $Countries[0]["ID"];
      }


      $IPTimezone = $IPData["timezone"];
      $Timezones = SQL("SELECT ID FROM Timezone Where Name = '$IPTimezone';");
      if ($Timezones != 0 && count($Timezones) > 0) {
        $Timezone = $Timezones[0]["ID"];
      }
    }

    $HashedPass = hash("sha256", $Pass);

    if ($ID = SQL("INSERT INTO User (FName, LName, UName, Password, Gender, Mail, Country, Timezone, Language) VALUES ('$FName', '$LName', '$UName', '$HashedPass', $Gender, '$Mail', $Country, $Timezone, $Language);", 2)) {
      if (($Token = GenerateUserToken($ID, $Pass)) !== false) {
        $Response["Payload"] = $Token;
        $Response["ReturnCode"] = 1;

        break;
      }
    }

    $Response["ReturnCode"] = -1;
    break;

  case '2':
    /////User Ping/////
    if (($ID = GetVerifyUser()) !== false) {
      if (SQL("UPDATE User SET LastSeen = $Now WHERE ID = $ID;", 1)) {
        $Response["Payload"] = GetUsers("ID, FName, LName, UName, Timezone, Language", "ID = $ID", true, false)[0];
        $Response["ReturnCode"] = 1;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }
    break;

  case '3':
    /////Get Detailed User Data/////
    if (($ID = GetVerifyUser()) !== false) {
      $Response["Payload"] = GetUsers("ID, FName, LName, UName, BirthDate, Gender, Mail, Phone, Address, Country, Timezone, Language, Timestamp", "ID = $ID", true, false)[0];
      $Response["ReturnCode"] = 1;
    } else {
      $Response["ReturnCode"] = -1;
    }
    break;

  case '4':
    /////Update User Profile/////
    if (!isset($_POST["FName"]) || empty($_POST["FName"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "FName";
      break;
    }

    if (!isset($_POST["LName"]) || empty($_POST["LName"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "LName";
      break;
    }

    if (!isset($_POST["Mail"]) || empty($_POST["Mail"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Mail";
      break;
    }

    if (!isset($_POST["Gender"]) || empty($_POST["Gender"]) || !ValText($_POST["Country"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Gender";
      break;
    }

    if (!isset($_POST["Country"]) || empty($_POST["Country"]) || !ValText($_POST["Country"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Country";
      break;
    }

    if (!isset($_POST["Timezone"]) || empty($_POST["Timezone"]) || !ValText($_POST["Timezone"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Timezone";
      break;
    }

    if (!isset($_POST["Language"]) || empty($_POST["Language"]) || !ValText($_POST["Language"], "NUM")) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Language";
      break;
    }

    if (isset($_POST["Phone"]) && !empty($_POST["Phone"]) && !ValText($_POST["Phone"], "NUM", "- ")) {
      $Response["ReturnCode"] = -3;
      $Response["ReturnParam"] = "Phone";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $FName = str_replace(' ', '', ucfirst(SQLSafe($_POST["FName"])));
    $LName = str_replace(' ', '', ucfirst(SQLSafe($_POST["LName"])));
    $Mail = str_replace(' ', '', strtolower(SQLSafe($_POST["Mail"])));
    $Gender = intval(SQLSafe($_POST["Gender"]));
    $Phone = str_replace(' ', '', str_replace('-', '', ltrim(SQLSafe($_POST["Phone"]), '0')));
    $Address = ltrim(rtrim(SQLSafe($_POST["Address"]), ' '), ' ');
    $Country = intval(SQLSafe($_POST["Country"]));
    $Timezone = intval(SQLSafe($_POST["Timezone"]));
    $Language = intval(SQLSafe($_POST["Language"]));

    //////////////////////////////////////////////////////////////////

    if (($ID = GetVerifyUser()) !== false) {
      $Users = SQL("SELECT Mail FROM User WHERE Mail = '$Mail' AND ID <> $ID;");
      if ($Users != 0 && count($Users) > 0) {
        $Response["ReturnCode"] = -4;
        break;
      }

      if (!empty($Phone)) {
        $Users = SQL("SELECT Phone FROM User WHERE Phone = '$Phone' AND ID <> $ID;");
        if ($Users != 0 && count($Users) > 0) {
          $Response["ReturnCode"] = -5;
          break;
        }
      }

      if (SQL("UPDATE User SET FName = '$FName', LName = '$LName', Mail = '$Mail', Country = $Country, Timezone = $Timezone, Language = $Language, Phone = '$Phone', Address = '$Address', LastSeen = $Now WHERE ID = $ID;", 1)) {
        $Response["ReturnCode"] = 1;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '5':
    /////Edit User Password/////
    if (!isset($_POST["OldPass"]) || empty($_POST["OldPass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "OldPass";
      break;
    }

    if (!isset($_POST["Pass"]) || empty($_POST["Pass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Pass";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $OldPass = SQLSafe($_POST["OldPass"]);
    $Pass = SQLSafe($_POST["Pass"]);

    //////////////////////////////////////////////////////////////////

    if (strlen($Pass) < 8) {
      $Response["ReturnCode"] = -3;
      break;
    }

    //////////////////////////////////////////////////////////////////

    if (($ID = GetVerifyUser()) !== false) {
      $HashedOldPass = hash("sha256", $OldPass);

      $Users = SQL("SELECT Password FROM User WHERE ID = $ID;");
      if ($Users == 0 || count($Users) <= 0 || $Users[0]["Password"] != $HashedOldPass) {
        $Response["ReturnCode"] = -4;
        break;
      }

      $HashedPass = hash("sha256", $Pass);

      if (SQL("UPDATE User SET Password = '$HashedPass', LastSeen = $Now WHERE ID = $ID;", 1)) {
        $Response["ReturnCode"] = 1;
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '6':
    /////Edit User Profile Picture/////
    if (!isset($_FILES["Image"]) || empty($_FILES["Image"]["name"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Image";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $Image = $_FILES["Image"];

    //////////////////////////////////////////////////////////////////

    if (($UID = GetVerifyUser()) !== false) {
      $Path = "../Resources/Users/Pictures/".$UID.".jpg";

      if(getimagesize($Image["tmp_name"]) !== false) {
        if (!file_exists($Path) || unlink($Path)) {
          if (move_uploaded_file($Image["tmp_name"], $Path)) {
            if (SQL("UPDATE User SET LastSeen = $Now WHERE ID = $UID;", 1)) {
              $Response["ReturnCode"] = 1;
            }
          }
        }
      }
    } else {
      $Response["ReturnCode"] = -1;
    }

    break;

  case '7':
    /////Forgot Password Handler/////
    if (!isset($_POST["Mail"]) || empty($_POST["Mail"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Mail";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $Mail = str_replace(' ', '', strtolower(SQLSafe($_POST["Mail"])));

    //////////////////////////////////////////////////////////////////

    $Users = SQL("SELECT ID FROM User WHERE Mail = '$Mail';");
    if ($Users == 0 || count($Users) <= 0) {
      $Response["ReturnCode"] = -1;
      break;
    }

    //////////////////////////////////////////////////////////////////

    $UID = $Users[0]["ID"];

    $OTP = rand(100000, 999999);
    $HashedOTP = hash("sha256", $OTP);

    $Trys = 3;
GenerateToken:
    $Token = RandString(32);
    $HashedToken = hash("sha256", $Token);
    $Expiry = $Now + 21600;

    if (SQL("INSERT INTO UserOTP (User, Type, OTP, Token, Timestamp, ClaimTS, Expiry) VALUES ('$UID', 1, '$HashedOTP', '$HashedToken', $Now, 0, $Expiry);", 1)) {
      $MailMessage = "https://nutridripp.com/Beta/change-password?token=".$Token;
      {
        $MailMessage =
        "<!DOCTYPE html>
        <html lang='en'>
          <head>
            <meta content='text/html; charset=utf-8' http-equiv='Content-Type' />
            <meta content='width=device-width, initial-scale=1.0' name='viewport' />
            <style>
              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                padding: 0;
              }

              a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: inherit !important;
              }

              #MessageViewBody a {
                color: inherit;
                text-decoration: none;
              }

              p {
                line-height: inherit
              }

              .desktop_hide,
              .desktop_hide table {
                mso-hide: all;
                display: none;
                max-height: 0px;
                overflow: hidden;
              }

              @media (max-width:520px) {
                .desktop_hide table.icons-inner {
                  display: inline-block !important;
                }

                .icons-inner {
                  text-align: center;
                }

                .icons-inner td {
                  margin: 0 auto;
                }

                .row-content {
                  width: 100% !important;
                }

                .image_block img.big {
                  width: auto !important;
                }

                .column .border,
                .mobile_hide {
                  display: none;
                }

                table {
                  table-layout: fixed !important;
                }

                .stack .column {
                  width: 100%;
                  display: block;
                }

                .mobile_hide {
                  min-height: 0;
                  max-height: 0;
                  max-width: 0;
                  overflow: hidden;
                  font-size: 0px;
                }

                .desktop_hide,
                .desktop_hide table {
                  display: table !important;
                  max-height: none !important;
                }
              }
            </style>
          </head>
          <body style='background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;'>
            <table border='0' cellpadding='0' cellspacing='0' class='nl-container' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;' width='100%'>
              <tbody>
                <tr>
                  <td>
                    <table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-1' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5;' width='100%'>
                      <tbody>
                        <tr>
                          <td>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;' width='500'>
                              <tbody>
                                <tr>
                                  <td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'>
                                    <table border='0' cellpadding='0' cellspacing='0' class='image_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'>
                                      <tr>
                                        <td style='padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:30px;width:100%;'>
                                          <div align='center' style='line-height:10px'>
                                            <a href='https://nutridripp.com/' style='outline:none' tabindex='-1' target='_blank'>
                                              <img alt='NutriDripp' class='big' src='https://nutridripp.com/resources/logo/logo-wide.svg' style='display: block; height: auto; border: 0; width: 500px; max-width: 100%;' title='NutriDripp' width='500' />
                                            </a>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-2' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5;' width='100%'>
                      <tbody>
                        <tr>
                          <td>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;' width='500'>
                              <tbody>
                                <tr>
                                  <td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'>
                                    <table border='0' cellpadding='0' cellspacing='0' class='image_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'>
                                      <tr>
                                        <td style='padding-bottom:5px;width:100%;padding-right:0px;padding-left:0px;'>
                                          <div align='center' style='line-height:10px'>
                                            <img alt='Password Reset Animation' src='https://nutridripp.com/resources/images/resetpass.gif' style='display: block; height: auto; border: 0; width: 350px; max-width: 100%;' title='Password Reset Animation' width='350' />
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='0' cellspacing='0' class='heading_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'>
                                      <tr>
                                        <td style='padding-top:10px;text-align:center;width:100%;'>
                                          <h1 style='margin: 0; color: #063149; direction: ltr; font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 25px; font-weight: 700; letter-spacing: normal; line-height: 150%; text-align: center; margin-top: 0; margin-bottom: 0;'>
                                            <strong>Forgot your password?</strong>
                                          </h1>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='10' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'>
                                      <tr>
                                        <td>
                                          <div style='font-family: Tahoma, Verdana, sans-serif'>
                                            <div class='txtTinyMce-wrapper' style='font-size: 12px; font-family: Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;'>
                                              <p style='margin: 0; font-size: 14px; text-align: center; mso-line-height-alt: 24px;'>
                                                <span style='font-size:16px;'>
                                                  <span style=''>Not to worry, we got you! </span>
                                                  <span style=''>Let's get you a new password.</span>
                                                </span>
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='15' cellspacing='0' class='button_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'>
                                      <tr>
                                        <td>
                                          <div align='center'>
                                            <a href='".$MailMessage."' style='text-decoration:none;display:inline-block;color:#000000;background-color:#9cd398;border-radius:20px;width:auto;border-top:1px solid #9cd398;font-weight:400;border-right:1px solid #9cd398;border-bottom:1px solid #9cd398;border-left:1px solid #9cd398;padding-top:10px;padding-bottom:10px;font-family:Tahoma, Verdana, Segoe, sans-serif;text-align:center;mso-border-alt:none;word-break:keep-all;' target='_blank'>
                                              <span style='padding-left:50px;padding-right:50px;font-size:18px;display:inline-block;letter-spacing:normal;'>
                                                <span style='font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;'>
                                                  <span data-mce-style='font-size: 18px; line-height: 36px;' style='font-size: 18px; line-height: 36px;'>
                                                    <strong>RESET PASSWORD</strong>
                                                  </span>
                                                </span>
                                              </span>
                                            </a>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='10' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'>
                                      <tr>
                                        <td>
                                          <div style='font-family: Tahoma, Verdana, sans-serif'>
                                            <div class='txtTinyMce-wrapper' style='font-size: 12px; font-family: Tahoma, Verdana, Segoe, sans-serif; text-align: center; mso-line-height-alt: 18px; color: #000000; line-height: 1.5;'>
                                              <p style='margin: 0; mso-line-height-alt: 21px;'>
                                                <span style='font-size:14px;'>If you didn't request to change your password, simply ignore this email.</span>
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-3' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5;' width='100%'>
                      <tbody>
                        <tr>
                          <td>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;' width='500'>
                              <tbody>
                                <tr>
                                  <td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'>
                                    <table border='0' cellpadding='15' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'>
                                      <tr>
                                        <td>
                                          <div style='font-family: Tahoma, Verdana, sans-serif'>
                                            <div class='txtTinyMce-wrapper' style='font-size: 12px; font-family: Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #393d47; line-height: 1.2;'>
                                              <p style='margin: 0; font-size: 14px; text-align: center;'>
                                                <span style='font-size:13px;'>
                                                  <span style=''>This link will expire in 6 hours. If you continue to have problems </span>
                                                  <span style=''>please feel free to contact us at <a href='mailto:support@nutridripp.com' rel='noopener' style='text-decoration: underline; color: #393d47;' target='_blank' title='support@nutridripp.com'>support@nutridripp.com</a>. <a href='https://nutridripp.com/' rel='noopener' style='text-decoration: underline; color: #393d47;' target='_blank'>UNSUBSCRIBE</a>
                                                  </span>
                                                </span>
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-4' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #063149;' width='100%'>
                      <tbody>
                        <tr>
                          <td>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;' width='500'>
                              <tbody>
                                <tr>
                                  <td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'>
                                    <table border='0' cellpadding='0' cellspacing='0' class='social_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='100%'>
                                      <tr>
                                        <td style='padding-bottom:5px;padding-top:5px;text-align:center;padding-right:0px;padding-left:0px;'>
                                          <table align='center' border='0' cellpadding='0' cellspacing='0' class='social-table' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt;' width='184px'>
                                            <tr>
                                              <td style='padding:0 7px 0 7px;'>
                                                <a href='https://www.facebook.com/MMavrick23' target='_blank'>
                                                  <img alt='Facebook' height='32' src='https://nutridripp.com/resources/icons/facebook.png' style='display: block; height: auto; border: 0;' title='Facebook' width='32' />
                                                </a>
                                              </td>
                                              <td style='padding:0 7px 0 7px;'>
                                                <a href='https://twitter.com/MMavrick23' target='_blank'>
                                                  <img alt='Twitter' height='32' src='https://nutridripp.com/resources/icons/twitter.png' style='display: block; height: auto; border: 0;' title='Twitter' width='32' />
                                                </a>
                                              </td>
                                              <td style='padding:0 7px 0 7px;'>
                                                <a href='https://instagram.com/MMavrick23' target='_blank'>
                                                  <img alt='Instagram' height='32' src='https://nutridripp.com/resources/icons/instagram.png' style='display: block; height: auto; border: 0;' title='Instagram' width='32' />
                                                </a>
                                              </td>
                                              <td style='padding:0 7px 0 7px;'>
                                                <a href='https://wa.me/+201093656729' target='_blank'>
                                                  <img alt='WhatsApp' height='32' src='https://nutridripp.com/resources/icons/whatsapp.png' style='display: block; height: auto; border: 0;' title='WhatsApp' width='32' />
                                                </a>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='0' cellspacing='0' class='html_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word; word-wrap: break-word;' width='100%'>
                                      <tr>
                                        <td>
                                          <div align='center' style='font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;'>
                                            <div style='margin-top: 5px;border-top:1px solid #ffffff;'></div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                    <table border='0' cellpadding='0' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'>
                                      <tr>
                                        <td style='padding-bottom:25px;padding-left:10px;padding-right:10px;padding-top:25px;'>
                                          <div style='font-family: Tahoma, Verdana, sans-serif'>
                                            <div class='txtTinyMce-wrapper' style='font-size: 12px; font-family: Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #ffffff; line-height: 1.2;'>
                                              <p style='margin: 0; text-align: center; font-size: 14px;'>
                                                <span style='font-size:15px;'>Multipurpose management solution for farms, gardens, landscapes and all kinds of agricultural usage.</span>
                                              </p>
                                              <br>
                                              <p style='margin: 0; text-align: center; font-size: 14px;'>
                                                <span style='font-size:13px;'>Nile University, 26th of July Corridor, El Sheikh Zayed, Giza, Egypt</span>
                                              </p>
                                              <p style='margin: 0; text-align: center; font-size: 14px;'>
                                                <span style='font-size:13px;'>info@nutridripp.com / (+20) 109 3656 729</span>
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table align='center' border='0' cellpadding='0' cellspacing='0' class='row row-5' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #052c42;' width='100%'>
                      <tbody>
                        <tr>
                          <td>
                            <table align='center' border='0' cellpadding='0' cellspacing='0' class='row-content stack' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;' width='500'>
                              <tbody>
                                <tr>
                                  <td class='column column-1' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;' width='100%'>
                                    <table border='0' cellpadding='0' cellspacing='0' class='text_block' role='presentation' style='mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;' width='100%'>
                                      <tr>
                                        <td style='padding-bottom:10px;padding-top:10px;'>
                                          <div style='font-family: Tahoma, Verdana, sans-serif'>
                                            <div class='txtTinyMce-wrapper' style='font-size: 12px; font-family: Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #ffffff; line-height: 1.2;'>
                                              <p style='margin: 0; text-align: center; font-size: 13px;'>
                                                <span style='font-size:13px;'>Copyright © 2022, NutriDripp. All rights reserved.</span>
                                              </p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
          </body>
        </html>
        ";
      }

      if (SendMail($MailMessage, "NutriDripp Account Password Reset", $Mail)) {
        $Response["ReturnCode"] = 1;
      }
    } else {
      if (--$Trys > 0) goto GenerateToken;
    }

    break;

  case '8':
    /////Password Reset Handler/////
    if (!isset($_POST["Pass"]) || empty($_POST["Pass"])) {
      $Response["ReturnCode"] = -2;
      $Response["ReturnParam"] = "Pass";
      break;
    }

    //////////////////////////////////////////////////////////////////

    $Token = SQLSafe($_POST["Token"]);
    $Pass = SQLSafe($_POST["Pass"]);

    //////////////////////////////////////////////////////////////////

    $HashedToken = hash("sha256", $Token);
    $Tokens = SQL("SELECT ID, User FROM UserOTP WHERE Type = 1 AND Token = '$HashedToken' AND (Expiry = 0 OR Expiry > $Now) AND ClaimTS <= 0 AND Active = 1;");
    if ($Tokens == 0 || count($Tokens) <= 0) {
      $Response["ReturnCode"] = -1;
      break;
    }

    if (strlen($Pass) < 8) {
      $Response["ReturnCode"] = ($Pass == "tokVal" ? 1 : -3);
      break;
    }

    //////////////////////////////////////////////////////////////////

    $ID = $Tokens[0]["ID"];
    $UID = $Tokens[0]["User"];

    $HashedPass = hash("sha256", $Pass);

    if (SQL("UPDATE UserOTP SET ClaimTS = $Now WHERE ID = $ID;", 1)) {
      if (SQL("UPDATE User SET Password = '$HashedPass', LastSeen = $Now WHERE ID = $UID;", 1)) {
        $Response["ReturnCode"] = 1;
      }
    }

    break;

  default:
    /////Failure Procedure/////
    $Response["ReturnCode"] = -999;
    break;
}

echo json_encode($Response);
exit();

function GenerateUserToken(int $UID, string $Pass = '', string $IP = '') {
  global $Now;

  if ($Pass == '') $Pass = RandString(16);
  if ($IP == '') $IP = $_SERVER['REMOTE_ADDR'];

  CreateNewToken:
  $SID = str_split(strval($Now + rand(10000000,99999999)), 4);
  $Token = hash("sha256", $SID[0].str_shuffle($Pass).$SID[1]);
  $HashedToken = hash("sha256", $Token);

  if (SQL("INSERT INTO UserToken (User, Token, IP, Timestamp)  VALUES ($UID, '$HashedToken', '$IP', $Now);", 1)) {
    return $Token;
  } else {
    $Tokens = SQL("SELECT Token FROM UserToken WHERE Token = '$HashedToken';");
    if ($Tokens != 0 && count($Tokens) > 0) goto CreateNewToken;
  }

  return false;
}

function GetUsers(string $fields = "*", string $conditions = "1", bool $AttachPictureTimestamp = true, bool $AttachOnlineStatus = false) {
  global $Now;
  $Users = SQL("SELECT $fields FROM User WHERE $conditions;");

  if ($Users == 0) {
    $Users = array();
  } else if ($AttachPictureTimestamp || $AttachCoverTimestamp || $AttachOnlineStatus) {
    for ($i=0; $i < count($Users); $i++) {
      if ($AttachPictureTimestamp) {
        if (!($Users[$i]["PictureTimestamp"] = filemtime("../Resources/Users/Pictures/".$Users[$i]["ID"].".jpg"))) {
          $Users[$i]["PictureTimestamp"] = 0;
          $Users[$i]["PictureLink"] = "";
        } else {
          $Users[$i]["PictureLink"] = "https://nutridripp.com/APIs/Resources/Users/Pictures/".$Users[$i]["ID"].".jpg?".$Users[$i]["PictureTimestamp"];
        }
      }

      if ($AttachOnlineStatus) {
        if (array_key_exists("LastSeen", $Users[$i])) {
          $Users[$i]["IsOnline"] = ($Now - intval($Users[$i]["LastSeen"]) <= intval(GetParam("OnlineStatusThreshold")));
        }
      }
    }
  }

  return $Users;
}
?>

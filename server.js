var saveMethod = "compressed";  // (native, compressed)  
var localSave = true; // FOR LOCAL SAVING FILE 
var loopTime = 10; // SECOND 
var PubPath = GetResourcePath(GetCurrentResourceName()).replace("//", "/"); // U CAN CHANGE PATH
var discordWebHook = ""; // PUT UR DISCORD WEBHOOK URL
 



var fs = require('fs');
const { Webhook  } = require('discord-webhook-node');
const hook = new Webhook(discordWebHook);
const mysqldump = require('mysqldump');
const date = new Date();
const [month, day, year]       = [date.getMonth(), date.getDate(), date.getFullYear()];
const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()];
async function getDumpData() {
if(saveMethod == "native") {
  dumpToFile = "";
  compressFile = false;
}else {
  dumpToFile = PubPath+`/sql/s4-sql-${day}-${month}-${year}-${hour}-${minutes}.sql.gz`;
  compressFile = true;
}
var pass = "";
if(getConfigFromConnectionString().password != 0) {  pass = getConfigFromConnectionString().password;   }
const result = await mysqldump({ connection: { host: getConfigFromConnectionString().host, user: getConfigFromConnectionString().user, password: pass, database: getConfigFromConnectionString().database,  }, dumpToFile: dumpToFile,  compressFile: compressFile,  });
  if(discordWebHook != "") {
    hook.sendFile(PubPath+`/sql/s4-sql-${day}-${month}-${year}-${hour}-${minutes}.sql.gz`);
    setTimeout(function(){ if(localSave == true){  fs.unlinkSync(PubPath+`/sql/s4-sql-${day}-${month}-${year}-${hour}-${minutes}.sql.gz`);  } }, 5000);
  }
  if(saveMethod == "native" && localSave == true) { SaveResourceFile(GetCurrentResourceName(),  `/sql/s4-sql-${day}-${month}-${year}-${hour}-${minutes}.sql`, result, result.length); } 
  setTimeout(function(){  
    getDumpData().then(function(result) {
      console.log("[S4-SQLSAVER] - YOUR MYSQL DUMP DATA SAVED");
    });
  }, loopTime*1000);
}
 
setTimeout(function(){  
  getDumpData().then(function(result) {
    console.log("[S4-SQLSAVER] - YOUR MYSQL DUMP DATA SAVED");
  });
}, loopTime*1000);
/// https://github.com/brouznouf/fivem-mysql-async
function getConfigFromConnectionString() {
  const connectionString = GetConvar('mysql_connection_string', 'mysql://root@localhost/fivem');
  let cfg = {};
  if (/(?:database|initial\scatalog)=(?:(.*?);|(.*))/gi.test(connectionString)) {
    // replace the old version with the new one
    const connectionStr = connectionString.replace(/(?:host|server|data\s?source|addr(?:ess)?)=/gi, 'host=').replace(/(?:port)=/gi, 'port=').replace(/(?:user\s?(?:id|name)?|uid)=/gi, 'user=').replace(/(?:password|pwd)=/gi, 'password=').replace(/(?:database|initial\scatalog)=/gi, 'database=');
    connectionStr.split(';').forEach(el => {
      const equal = el.indexOf('=');
      const key = equal > -1 ? el.substr(0, equal) : el;
      const value = equal > -1 ? el.substr(equal + 1) : '';
      cfg[key.trim()] = Number.isNaN(Number(value)) ? value : Number(value);
    });
  } else if (/mysql:\/\//gi.test(connectionString)) {
    cfg = Object(ConnectionConfig["parseUrl"])(connectionString);
  }
  return cfg;
}
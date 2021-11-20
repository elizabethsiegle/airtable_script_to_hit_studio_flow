const {AIRTABLE_API_KEY, SIGNAL_SCAVENGER_HUNT_BASE_ID, TWILIO_STUDIO_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, MY_PHONE_NUMBER} = input.config();
const studioCreateExecution = async (payload, twilioStudioSid, twilioAccountSid, twilioAuthToken) => {
    try {
        const basicAuth = b2a(`${twilioAccountSid}:${twilioAuthToken}`);
        const CREATE_EXECUTION_URL = `https://studio.twilio.com/v2/Flows/${twilioStudioSid}/Executions`;
        const result = await fetch(CREATE_EXECUTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization' : `Basic ${basicAuth}`
            },
            body: new URLSearchParams(payload)
        })
        return result.json();
    } catch(e) {
        console.error(e);
        throw e;
    }
}
const HYDRATE_TABLE_FIELDS = ['Message', 'Status'];
const listRecords = async(apiKey, baseId, tableName, filterObject = {}, offsetId = null) => {
    try {
        let url = `https://api.airtable.com/v0/${baseId}/${tableName}?${serialize(filterObject)}`;

        if(offsetId) {
          url = `${url}&offset=${offsetId}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${apiKey}`
          }
        });

        const result = await response.json();
        const {offset, records} = result;

        if(offset) {
          const additionalRecords = await listRecords(apiKey, baseId, tableName, filterObject, offset);
          records.push(...additionalRecords);
        }

        return records;
    } catch(e) {
        return e;
    }
}

//Credits: https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
const b2a = (a) => {
  var c, d, e, f, g, h, i, j, o, b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", k = 0, l = 0, m = "", n = [];
  if (!a) return a;
  do c = a.charCodeAt(k++), d = a.charCodeAt(k++), e = a.charCodeAt(k++), j = c << 16 | d << 8 | e, 
  f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < a.length);
  return m = n.join(""), o = a.length % 3, (o ? m.slice(0, o - 3) :m) + "===".slice(o || 3);
}
let table = base.getTable('Lizzieairtablepost');
let field = table.getField("Status");
let query = await table.selectRecordsAsync();
const driver = async() => {
    let filteredRecords = query.records.filter(record => {
        let msg = record.getCellValue('Message');
        let status = record.getCellValue("Status"); 
        return msg !== null && status.name == "Todo";
    });
    let msg = filteredRecords.slice(-1); //last in array
    
    console.log(JSON.stringify(msg.toString().replace("name:", "")));
    filteredRecords.forEach
    const payload = {
        'To': MY_PHONE_NUMBER,
        'From': TWILIO_PHONE_NUMBER,
        'Parameters': JSON.stringify({
            'msg': msg
        })
    };
    const result = await studioCreateExecution(payload, TWILIO_STUDIO_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    output.set('result', JSON.stringify(result));
}
await driver();

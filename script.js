const {AIRTABLE_API_KEY, SIGNAL_SCAVENGER_HUNT_BASE_ID, TWILIO_STUDIO_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, MY_PHONE_NUMBER, recordsFoundMsgList, numRecordsFound, recordsFoundIds} = input.config();
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


//Credits: https://gist.github.com/oeon/0ada0457194ebf70ec2428900ba76255
const b2a = (a) => {
  var c, d, e, f, g, h, i, j, o, b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", k = 0, l = 0, m = "", n = [];
  if (!a) return a;
  do c = a.charCodeAt(k++), d = a.charCodeAt(k++), e = a.charCodeAt(k++), j = c << 16 | d << 8 | e, 
  f = 63 & j >> 18, g = 63 & j >> 12, h = 63 & j >> 6, i = 63 & j, n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i); while (k < a.length);
  return m = n.join(""), o = a.length % 3, (o ? m.slice(0, o - 3) :m) + "===".slice(o || 3);
}
let table = base.getTable('Lizzieairtablepost');
let field = table.getField("Sent");
let query = await table.selectRecordsAsync();
let recordMsgSentIdArr = [];
let msg;
const driver = async() => {
    console.log(`numRecordsFound ${numRecordsFound}`);
    if(numRecordsFound == 0) {
        for (let record of query.records) {
            table.updateRecordAsync(record, {
                "Sent": false,
            })    
        }
        msg = "go get some water, you hardworking fiend"
    }
    else {
        msg = recordsFoundMsgList.slice(-1); //first in array
    }
    const payload = {
        'To': MY_PHONE_NUMBER,
        'From': TWILIO_PHONE_NUMBER,
        'Parameters': JSON.stringify({
            'msg': msg
        })
    };
    let recordMsgSentId = recordsFoundIds.slice(-1); //first in array
    recordMsgSentIdArr.push(recordMsgSentId);
    
    const result = await studioCreateExecution(payload, TWILIO_STUDIO_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    output.set('recordMsgSentId', recordMsgSentId);
    output.set('result', JSON.stringify(result));
}
await driver();
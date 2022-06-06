const axios = require('axios').default;

function parseDownloadUrl(aid, cid) {
    return axios(`https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=1&type=&otype=json&platform=html5&high_quality=1`);
}

function parseBVID(id, callback) {
    axios('http://api.bilibili.com/x/web-interface/view?bvid=' + id).then(
        dt => {
            let data = dt.data.data;
            let aid = data.aid;
            let cid = data.cid;
            parseDownloadUrl(aid, cid).then(
                res => {
                    callback(null, res.data.data.durl);
                }
            ).catch(reason => {
                callback(reason);
            })
        }
    ).catch(resson => {
        callback(resson);
    })
}

class bilibilidownload extends NIL.ModuleBase {
    onStart(api) {
        api.listen('onMainMessageReceived', (e) => {
            let raw = e.raw_message;
            if (raw.startsWith('b站解析')) {
                let res = e.raw_message.split(' ')[1].match(/(bv|BV)(.+)/);
                if (res == null) return;
                let bv = res[2];
                if (bv.includes('/')) bv = bv.split('/')[0];
                if (bv.includes('?')) bv = bv.split('?')[0];
                parseBVID(bv,(err,data)=>{
                    if(err){
                        e.reply('没有这个bv号哦，检查一下吧',true);
                    }else{
                        e.reply(data[0].url,true);
                    }
                })
            }
        })
    }
}

module.exports = new bilibilidownload;
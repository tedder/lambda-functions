console.log('Loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});

exports.handler = function(event, context) {
   console.log('Received event:');
   console.log(JSON.stringify(event, null, '  '));
   // Get the object from the event and show its content type
   var bucket = event.Records[0].s3.bucket.name;
   var key = event.Records[0].s3.object.key;
   
   if (! (/^lols/i).test(key) || key == "lols/index.html" ) {
     context.done(null, "outta. we only care about lols.");
     return;
   }

   console.log('have object: ' + key + ' from bucket ' + bucket);

   //var a = s3.listObjects({ Bucket: bucket, Prefix: "/lols/" }, function(err, data) {
   var a = s3.listObjects({ Bucket: bucket, Prefix: "lols/" }, function(err, data) {
     if (err) {
         console.log("list error", err);
         context.done('error', "error: " + err);
         return;
     }
     // success case
     console.log("got list data"); //, data);
     if (! data ) {
         context.done('error', "empty list, outta.");
         return;
     }

     var accum = data.Contents.map(function(entry) {
       img = '<img src="http://tedder.me/' + entry.Key + '" style="width=100%; max-width=600px"/>' + "\n";
       return img;
       //console.log("entry in iterator: ", entry);
     });
     console.log("accum: ", accum);
     var html = accum.join('');
     
     s3.putObject({
					Bucket: bucket,
					Key: "lols/index.html",
					Body: html,
					ContentType: "text/html"
				}, function(err, data) {
				    if (err) {
                      console.log("put error", err);
                      context.done('error', "put error: " + err);
                      return;
                    }
				    console.log("data: ", data)
				    context.done(null, data);
				});
     //return accum;
     //context.done(null, Object.prototype.toString.call(a));
     //context.done(null, accum);

   });

};

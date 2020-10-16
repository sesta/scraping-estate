var SCRAPING_TARGET_URL = PropertiesService.getScriptProperties().getProperty('SCRAPING_TARGET_URL');
var SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
var SHEET_NAME = PropertiesService.getScriptProperties().getProperty('SHEET_NAME');
var SLACK_URL = PropertiesService.getScriptProperties().getProperty('SLACK_URL');
var LINE_GROUP_ID = PropertiesService.getScriptProperties().getProperty('LINE_GROUP_ID');
var LINE_SECRET_KEY = PropertiesService.getScriptProperties().getProperty('LINE_SECRET_KEY');

function scraping() {
  var url = SCRAPING_TARGET_URL;
  var html = UrlFetchApp.fetch(url).getContentText('UTF-8');

  var imagePathes = Parser.data(html)
    .from('<span class="img_area" style="background-image:url(')
    .to(')"></span>').iterate();
  var metaStrings = Parser.data(html)
    .from('<span class="text_area">')
    .to('</span>').iterate();
  var estateIds = Parser.data(html)
    .from('<a href="/id/')
    .to('">').iterate();

  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();

  var oldImageUrls = [];
  for(var i = 0; i <= imagePathes.length + 10; i++){
    var oldTargetRow = lastRow - i + 1;
    if (oldTargetRow < 1) {
      break;
    }

    oldImageUrls.push(sheet.getRange('H' + oldTargetRow).getValue());
  }

  var bubbles = [];
  for(var i = imagePathes.length - 1; i >= 0; i--){
    var metas = metaStrings[i].replace('<br/ >', '<br />').split('<br />');
    var name = metas[0];
    var roomType = metas[2].split(' / ')[0];
    var price = metas[2].split(' / ')[1];
    var place = metas[1];
    var updateDate = metas[3];
    var imageUrl = 'https://tomigaya.jp' + imagePathes[i];
    var pageUrl = 'https://tomigaya.jp/id/' + estateIds[i];

    if(oldImageUrls.indexOf(imageUrl) == -1){
      lastRow += 1;
      sheet.getRange('A' + lastRow).setValue('=IMAGE("' + imageUrl + '")');
      sheet.getRange('B' + lastRow).setValue(name);
      sheet.getRange('C' + lastRow).setValue(place);
      sheet.getRange('D' + lastRow).setValue(roomType);
      sheet.getRange('E' + lastRow).setValue(price);
      sheet.getRange('F' + lastRow).setValue(updateDate);
      sheet.getRange('G' + lastRow).setValue(pageUrl);
      sheet.getRange('H' + lastRow).setValue(imageUrl);
 
      postSlack(name, roomType, price, place, pageUrl, imageUrl);
      bubbles.push({
        type: 'bubble',
        size: 'kilo',
        hero: {
          type: 'image',
          url: imageUrl,
          size: 'full',
          aspectMode: 'cover',
          aspectRatio: '1:1'
        },
        action: {
          type: 'uri',
          label: 'Go',
          uri: pageUrl
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: name,
              weight: 'bold',
              size: 'sm',
              wrap: true
            },
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: roomType + ' / ' + price + ' / ' + place,
                  wrap: true,
                  color: '#8c8c8c',
                  size: 'xs',
                  flex: 5
                }
              ]
            }
          ],
          spacing: 'sm',
          paddingAll: '13px'
        }
      });
    }
  }

  if (bubbles.length > 0) {
    postLine(metas[0], bubbles);
  }
}

function postSlack(name, roomType, price, place, pageUrl, imageUrl) {
  UrlFetchApp.fetch(SLACK_URL, {
    method: 'post',
    payload: {
      payload: JSON.stringify({
        text: '【' + roomType + '】' + name + '【' + price + '】',
        username: '新しい物件があったよ',
        blocks: [
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*' + name + '*\n\n- ' + roomType + '\n- ' + price + '\n- ' + place + '\n\n' + pageUrl
            },
            accessory: {
              type: 'image',
              image_url: imageUrl,
              alt_text: '物件画像'
            }
          },
          {
            type: 'divider'
          }
        ]
      })
    }
  });
}

function postLine(name, bubbles) {
  var message = {
    to: LINE_GROUP_ID,
    messages: [
      {
        type: 'flex',
        altText: name,
        contents: {
          type: 'carousel',
          contents: bubbles
        }
      }
    ]
  };
  var data = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + LINE_SECRET_KEY
    },
    payload: JSON.stringify(message)
  };

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', data);
}

function doGet(event) {
  console.log(event.postData);
}

function doPost(event) {
  console.log(event.postData);
}


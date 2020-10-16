特定のページをスクレイピングしてSlackやLINEに流します
GASで動作します

## スクレイピング
スクレイピングはGASのライブラリである[Parser](https://www.kutil.org/2016/01/easy-data-scrapping-with-google-apps.html)を使っています。
Parserは開始と終了の文字列を指定して、その間の値を取得するシンプルなパーサーです。

## Slack
SlackにはIncoming Webhookを使ってBlockの形式で投稿します。
Blockはdivider(区切り線)とsectionに画像をつけたシンプルな構成です。

![SLACKに投稿したときの画像](https://raw.githubusercontent.com/sesta/assets/master/images/scraping-estate/post-slack.png)

## LINE
LINEは[Flex Message](https://developers.line.biz/ja/docs/messaging-api/using-flex-messages/)をグループチャットに対して送信しています。

Flex MessageではBubble(カード)を横に並べる表示になっていて、カードを押した際には設定したリンク先に移動することが可能です。

![LINEに投稿したときの画像](https://raw.githubusercontent.com/sesta/assets/master/images/scraping-estate/post-line.png)


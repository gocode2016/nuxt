import ejs from 'ejs';
const tpl = `
<xml> 
  <ToUserName>< ![CDATA[<%= toUserName %>] ]></ToUserName> 
  <FromUserName>< ![CDATA[<%= fromUserName %>] ]></FromUserName> 
  <CreateTime><%= createTime %></CreateTime> 
  <MsgType>< ![CDATA[<%= msgType %>] ]></MsgType> 
  
  <% if (msgType === 'text') { %>
    <Content>< ![CDATA[<%= content %>] ]></Content> 
  <!--<% else if (msgType === 'text') { %>-->
  <!--<Image><MediaId>< ![CDATA[media_id] ]></MediaId></Image>-->
  <!--<Voice><MediaId>< ![CDATA[media_id] ]></MediaId></Voice>-->
  <!--<Video><MediaId>< ![CDATA[media_id] ]></MediaId><Title>< ![CDATA[title] ]></Title><Description>< ![CDATA[description] ]></Description></Video>-->
  <!--<Music><Title>< ![CDATA[TITLE] ]></Title><Description>< ![CDATA[DESCRIPTION] ]></Description><MusicUrl>< ![CDATA[MUSIC_Url] ]></MusicUrl><HQMusicUrl>< ![CDATA[HQ_MUSIC_Url] ]></HQMusicUrl><ThumbMediaId>< ![CDATA[media_id] ]></ThumbMediaId></Music>-->
  <!--<ArticleCount>2</ArticleCount><Articles><item><Title>< ![CDATA[title1] ]></Title> <Description>< ![CDATA[description1] ]></Description><PicUrl>< ![CDATA[picurl] ]></PicUrl><Url>< ![CDATA[url] ]></Url></item><item><Title>< ![CDATA[title] ]></Title><Description>< ![CDATA[description] ]></Description><PicUrl>< ![CDATA[picurl] ]></PicUrl><Url>< ![CDATA[url] ]></Url></item></Articles>-->
</xml>
`

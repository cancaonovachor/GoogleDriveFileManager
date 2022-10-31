// 書き込み楽譜操作関係




/**
 * @brief PDFを作成し指定したフォルダに保存する関数
 * @param folderId 出力先のフォルダID 
 * @param preId プレゼンテーションID
 * @return true: 成功、false: 失敗
 * @return pdfId 作成したPDFファイルのID
 */
function createPdf(folderId, preId)
{
  //PDFを作成するためのベースとなるURL
  let baseUrl = "https://docs.google.com/presentation/d/"
          +  preId
          + "/export?";

  //PDFのオプションを指定
  let pdfOptions = "&exportFormat=pdf&format=pdf"
              + "&size=A4" //用紙サイズ (A4)
              + "&fitw=true";  //ページ幅を用紙にフィットさせるか true: フィットさせる / false: 原寸大

  //PDFを作成するためのURL
  let url = baseUrl + pdfOptions;
  
  let pdfId = "";
  try
  {
    //アクセストークンを取得する
    let token = ScriptApp.getOAuthToken();

    //headersにアクセストークンを格納する
    let options = {
      headers: {
          'Authorization': 'Bearer ' +  token
      }
    };

    // PDFファイル名の作成("[Edit] プレゼンテーション名_日付.pdf")
    let fileName = SlidesApp.openById(preId).getName();
    let date = new Date();
    date = Utilities.formatDate(date, "Asia/Tokyo", "yyyyMMdd");
    let pdfFileName = "[Edit] " + fileName + "_" + date + ".pdf";

    //PDFを作成する
    let blob = UrlFetchApp.fetch(url, options).getBlob().setName(pdfFileName);

    //PDFの保存先フォルダー
    //フォルダーIDは引数のfolderIdを使用します
    let folder = DriveApp.getFolderById(folderId);

    //PDFを指定したフォルダに保存する
    let pdfFile = folder.createFile(blob);
    pdfId = pdfFile.getId();
  }
  catch (e)
  {
    console.error(e);
    return [false, ""];
  }

  return [true, pdfId];  
}


/**
 * @brief 書き込み楽譜を作成する(スライドのサイズは手動で設定する必要あり)
 * @param fileName 書き込み楽譜ファイル名
 * @param imgFolderId 書き込み楽譜用の画像（JPEG）のフォルダID
 * @return fileId 作成されたファイルのID
 */
function makeWritingScore(fileName, imgFolderId)
{
  // Presentationファイルを新規作成
  let fileId = makeNewPresentation(fileName);

  // 画像データのインポート
  if ("" != fileId)
  {
    importImg2Presentation(fileId, imgFolderId);
  }

  return fileId;
}

/**
 * @brief Presentationファイルを新規作成し、指定のフォルダへ移動させる
 * @param fileName ファイル名
 * @return fileId 作成されたファイルID
 */
function makeNewPresentation(fileName)
{
  // ファイルを新規作成
  let presentation, fileId;
  try
  {
    presentation = SlidesApp.create(fileName);
    
    // スライドは一旦全ページ削除
    let slides = presentation.getSlides();
    slides[0].remove();
    
    fileId = presentation.getId();
  }
  catch (e)
  {
    console.error(e);
    return "";
  }

  return fileId;
}


/**
 * @brief 画像ファイルをインポートする
 * @param fileId ファイルID
 * @param imgFolderId 画像ファイルのフォルダID
 * @return true: 成功、false: 失敗
 */
function importImg2Presentation(fileId, imgFolderId)
{
  // 画像ファイルのフォルダを一旦閲覧可能状態にする
  // （アクセス制限ありの状態では画像を使用することができない）
  let imgFolder;
  try
  {
    imgFolder = DriveApp.getFolderById(imgFolderId);
    imgFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  catch (e)
  {
    console.error(e);
    return false;
  }

  // アクセス権限が切り替わるまで少し待つ（2000ms）
  Utilities.sleep(2000);

  // 画像ファイルのURLのリストを取得
  let imgUrlArray = getImgUrlArray(imgFolder, MimeType.JPEG);

  if (null == imgUrlArray)
  {
    // 画像ファイルのフォルダのアクセス権限を元に戻す
    imgFolder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.EDIT);
    return false;
  }

  // 画像ファイル数分スライドを追加し、画像をインポート
  try
  {
    let presentation = SlidesApp.openById(fileId);
    for (let i = 0; i < imgUrlArray.length; i++)
    {
      let slide = presentation.appendSlide();

      // 背景画像に設定
      slide.getBackground().setPictureFill(imgUrlArray[i].url);
    }
  }
  catch (e)
  {
    // 画像ファイルのフォルダのアクセス権限を元に戻す
    imgFolder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.EDIT);
    return false;
  }

  // 画像ファイルのフォルダのアクセス権限を元に戻す
  imgFolder.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.EDIT);

  return true;
}


/**
 * @brief 指定したフォルダから、指定した拡張子の画像ファイルのURLリストを取得する
 * @param imgFolder 画像ファイルのフォルダ
 * @param mimtype 拡張子（ファイルタイプ）
 * @return imgUrlArray 画像ファイルのURLリスト
 */
function getImgUrlArray(imgFolder, mimetype)
{
  let imgFiles = imgFolder.getFilesByType(mimetype);
  let imgUrlArray = [];
  while (imgFiles.hasNext())
  {
    let imgFile = imgFiles.next();

    // そのままgetUrl()で取得しても画像を使用することはできない
    // https://drive.google.com/uc?id={ファイルID}&.jpg の形式にする
    let imgUrl = "https://drive.google.com/uc?id=" + imgFile.getId() + "&.jpg";
    imgUrlArray.push({
      name:imgFile.getName(),
      url:imgUrl
    });
  }

  if (0 == imgUrlArray.length)
  {
    return null;
  }

  // 取得したURLを、画像ファイル名でソート
  // sort内関数の戻り値が
  // 　正の場合：b を a の前に移動
  // 　負の場合：a を b の前に移動
  // 　0の場合：並び替え無し
  imgUrlArray.sort(function(a, b) {
    if (a.name > b.name)
    {
      return 1;
    }
    else if (a.name < b.name)
    {
      return -1;
    }
    else
    {
      return 0;
    }
  });

  return imgUrlArray;
}
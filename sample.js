// 書き込み楽譜のPDF書き出し
function outputWritingScorePdf()
{
  // 作成対象
  let scoreList = [
    //{folderId:"1vguiePU-fuyt5JJhJVvUK7Y4bDliyklx", preId:"14J1wEMYqVS8OpXEFgGbR5zw4z2L9rMDL9lJFTygES0s"},  // Kalkadunga
    //{folderId:"15A9b6humAMXIEo5ARS32GhFaOP4BSdol", preId:"15euol_zJivy3lbvQI9oEoZPv1dfZqSkjVyzZ6m4Iq88"},  // Thou my
    //{folderId:"13z4g2FvHEw56KRN-eUUE-feKhh4m67Y4", preId:"1jAXEuFUS2pQb51yMzQAEijkXax-AcJm3ZzFx9vzHPBc"},  // Surrexit
    //{folderId:"1XCyBsq22dR7oj4RswC_6ZmvM-EVv5BU_", preId:"1AlClTVBK8s9ucfDOWALo8yMQNNHqSkVOE36c2SCbUec"},  // Chanson
    //{folderId:"1sBLq_DzWMoE28wbXN38ICNZ_Ig4ssitb", preId:"1N83YSPhITKD4AciqyfPTBvVr4p1zqiU3BZL-i3y__dw"},  // Nyon Nyon
    {folderId:"1eSi6NRRQSXWU_vRutjQo91h_-TkK3P4P", preId:"1TaEKdye4xPyoAr5YVx_a6V2W4A680W5X98obgXD-qT0"}, // Viel werden
    {folderId:"1H-Oj_PWQF4xgDbnVswmqBYy_mo4wtOlh", preId:"1uTb4Ba4caZOhTHXF43xLc9ksKYzCNRaN8PEwxYQrb-w"}, // Beati Mortui
    {folderId:"1iBgfD3gUG_53ifM6PlLP_nIZOTauVwRX", preId:"1oKJY4nuOlC07Y5Aswe8EFNWX4BbVqR89upW6awKC6sQ"},  // Vecchie letrose
    {folderId:"1R7Dwd84mPIob5ecymvUYyT6QQgzBciql", preId:"1mUT_bwPDVvw1axg8gaRWf3fEWCEqtiCOGmJZUVB5zF0"},  // Ave Maria(Josquin)
    //{folderId:"", preId:""},  // ツナガル
    //{folderId:"", preId:""},  // シル
  ];

  // PDF書き出し
  let pdfIdList = [];
  for (let i = 0; i < scoreList.length; i++)
  {
    let ret, pdfId;
    [ret, pdfId] = WritingScoreOperator.createPdf(scoreList[i].folderId, scoreList[i].preId);
    pdfIdList.push(pdfId);
  }

  // 見学者用楽譜を一旦全削除
  let visitorFolderId = "1dR74Fln5itavtNVM3KeRUFAGnUusXjHi";
  let visitorFolder = DriveApp.getFolderById(visitorFolderId);
  let visitorFiles = visitorFolder.getFiles();
  while (visitorFiles.hasNext())
  {
    FileOperator.removeFile(visitorFiles.next().getId());
  }

  for (let i = 0; i < pdfIdList.length; i++)
  {
    // PDF書き出ししたファイルを見学者用フォルダにコピー
    let ret, copiedFileId;
    [ret, copiedFileId] = FileOperator.copyFile(visitorFolderId, pdfIdList[i]);

    // 見学者用フォルダの閲覧者に対してダウンロード、印刷、コピーを制限する
    AccessAuthOperator.restrictFileCopy(copiedFileId, true);
  }
}


// 書き込み楽譜（Presentation）の作成
function makeWritingScore()
{
  let fileName = "Sammlet zuvor das Unkraut";  // 書き込み楽譜ファイル名
  let fileFolderId = "1JomFQoPFPGMpB1nHVW-H1Ki_reT7qYRa";  // 楽譜フォルダのID
  let imgFolderId = "1EbofqnMcBjqp7Bgc38WhcyLF4K9VTMxV"; // 書き込み楽譜用の画像（JPEG）のフォルダID

  // Presentationを作成
  let presentationId = WritingScoreOperator.makeWritingScore(fileName, imgFolderId);

  // Presentationを楽譜フォルダに移動
  FileOperator.moveFile(fileFolderId, presentationId);
}

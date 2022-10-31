// ファイル操作関係


/**
 * @brief 指定したフォルダにファイルを移動する
 * @param folderId フォルダID
 * @param fileId ファイルID
 * @return true: 成功、false: 失敗
 */
function moveFile(folderId, fileId)
{
  let folder, file;

  try
  {
    // フォルダ、ファイルのインスタンスを取得
    folder = DriveApp.getFolderById(folderId);
    file = DriveApp.getFileById(fileId);
  }
  catch (e)
  {
    // IDが不正
    console.error(e);
    return false;
  }

  try
  {
    // 移動処理
    file.moveTo(folder);
  }
  catch (e)
  {
    // 何らかの理由で移動失敗
    console.error(e);
    return false;
  }

  return true;
}


/**
 * @brief 指定したフォルダにファイルを複製する
 * @param folderId フォルダID
 * @param fileId ファイルID
 * @return true: 成功、false: 失敗
 * @return copiedFileId 複製したファイルのID
 */
function copyFile(folderId, fileId)
{
  let folder, file;

  try
  {
    // フォルダ、ファイルのインスタンスを取得
    folder = DriveApp.getFolderById(folderId);
    file = DriveApp.getFileById(fileId);
  }
  catch (e)
  {
    // IDが不正
    console.error(e);
    return [false, ""];
  }

  let copiedFileId = "";
  try
  {
    // 複製処理
    let copiedFile = file.makeCopy(folder);
    copiedFileId = copiedFile.getId();
  }
  catch (e)
  {
    // 何らかの理由で複製失敗
    console.error(e);
    return [false, ""];
  }

  return [true, copiedFileId];
}


/**
 * @brief 指定したファイル名が、指定したフォルダ内に存在するかチェックする
 * @param folderId フォルダID
 * @param fileName ファイル名
 * @return true: 存在する、false: 存在しない
 * @return fileId ファイルID
 */
function isExistFileName(folderId, fileName)
{
  // フォルダのインスタンスを取得
  let folder;
  try
  {
    folder = DriveApp.getFolderById(folderId);
  }
  catch (e)
  {
    // IDが不正
    console.error(e);
    return [false, ""];
  }

  // ファイル検索
  let files;
  try
  {
    files = folder.searchFiles("title = " + "'" + fileName + "'");
  }
  catch (e)
  {
    // ファイル検索に失敗
    console.error(e);
    return [false, ""];
  }

  // 検索結果の確認
  let fileId = "";
  while (files.hasNext())
  {
    let file = files.next();
    fileId = file.getId();
  }

  if ("" == fileId)
  {
    return [false, ""];
  }
  else
  {
    return [true, fileId];
  }
}


/**
 * @brief 指定したファイルを削除する（ゴミ箱に移動させる）
 * @param fileId ファイルID
 * @return true: 成功、false: 失敗
 */
function removeFile(fileId)
{
  // ファイルのインスタンスを取得
  let file;
  try
  {
    file = DriveApp.getFileById(fileId);
  }
  catch (e)
  {
    // IDが不正
    console.error(e);
    return false;
  }

  // ファイルのゴミ箱のフラグをtrueにする
  try
  {
    file.setTrashed(true);
  }
  catch (e)
  {
    // 削除処理に失敗
    console.error(e);
    return false;
  }

  return true;
}
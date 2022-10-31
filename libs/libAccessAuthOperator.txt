// アクセス権操作関係


/**
 * @brief フォルダにアクセス権を付与する
 * @param gmail アクセス権対象者のアドレス
 * @param folderId アクセス権を付けるフォルダのID
 * @param editor 編集権限の有無(true: 編集権限あり、false: 閲覧権限のみ)
 * @return true: 成功、false: 失敗
 */
function addAccessAuth(gmail, folderId, editor)
{
  try
  {
    if (true == editor)
    {
      // 「編集者」として追加、通知はオフ（false）
      Drive.Permissions.insert(
        {
          'role': 'writer',           // "編集者"として追加
          'type': 'user',             // "ユーザー"を追加
          'value': gmail,             // Gmailアドレス
        },
        folderId,                     // 対象となるフォルダID
        {
          'sendNotificationEmails': 'false'   // 通知メールを飛ばさない
        }
      );
    }
    else
    {
      // 「閲覧者」として追加、通知はオフ（false）
      Drive.Permissions.insert(
        {
          'role': 'reader',           // "閲覧者"として追加
          'type': 'user',             // "ユーザー"を追加
          'value': gmail,             // Gmailアドレス
        },
        folderId,                     // 対象となるフォルダID
        {
          'sendNotificationEmails': 'false'   // 通知メールを飛ばさない
        }
      );
    }
  }
  catch (e)
  {
    console.error(e);
    return false;
  }

  return true;
}


/**
 * @brief フォルダからアクセス権を削除する
 * @param gmail アクセス権削除対象者のアドレス
 * @param folderId アクセス権を削除するフォルダのID
 * @param editor 編集権限の有無(true: 編集権限あり、false: 閲覧権限のみ)
 * @return true: 成功、false: 失敗
 */
function delAccessAuth(gmail, folderId, editor)
{
  try
  {
    // フォルダのインスタンスを取得
    let folder = DriveApp.getFolderById(folderId);

    if (true == editor)
    {
      folder.removeEditor(gmail);
    }
    else
    {
      folder.removeViewer(gmail);
    }
  }
  catch (e)
  {
    console.error(e);
    return false;
  }

  return true;
}


/**
 * @brief フォルダからアクセス権限の一覧を取得する
 * @param folderId フォルダID
 * @return true: 成功、false: 失敗
 * @return owner オーナー情報
 * @return editors 編集権限者のアドレスリスト[O]
 * @return viewers 閲覧権限者のアドレスリスト[O]
 */
function getAccessAuthList(folderId)
{
  let owner, editors, viewers;

  try
  {
    // フォルダのインスタンスを取得
    let folder = DriveApp.getFolderById(folderId);

    // アクセス権限の一覧を取得
    owner = folder.getOwner();
    editors = folder.getEditors();
    viewers = folder.getViewers();
  }
  catch (e)
  {
    console.error(e);
    return [false, null, null];
  }

  return [true, owner, editors, viewers];
}


/**
 * @brief 指定したファイルのダウンロード、印刷、コピーを制限する
 * @param fileId ファイルID
 * @param restriction true: 制限あり、false: 制限なし
 * @return true: 成功、false: 失敗
 */
function restrictFileCopy(fileId, restriction)
{
  Drive.Files.update (
    {
      copyRequiresWriterPermission : restriction
    },
    fileId,
    null,
    {
      supportsAllDrives : true
    }
  );
}

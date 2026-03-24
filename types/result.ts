// 成功・失敗を型で表現する Result 型
// throw せずに呼び出し元でエラーを処理できるため、制御フローが明確になる
type SuccessResult<T> = {
  isSuccess: true;
  data: T;
};

type ErrorResult = {
  isSuccess: false;
  errorMessage: string;
};

export type Result<T> = SuccessResult<T> | ErrorResult;

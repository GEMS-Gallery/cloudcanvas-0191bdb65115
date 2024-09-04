export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Time = IDL.Int;
  const FileInfo = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'size' : IDL.Nat,
    'uploadTime' : Time,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  return IDL.Service({
    'deleteFile' : IDL.Func([IDL.Nat], [Result_1], []),
    'getFiles' : IDL.Func([], [IDL.Vec(FileInfo)], ['query']),
    'uploadFile' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };

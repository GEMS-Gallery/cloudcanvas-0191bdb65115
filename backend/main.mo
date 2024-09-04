import Hash "mo:base/Hash";

import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";

actor {
  type FileInfo = {
    id: Nat;
    name: Text;
    size: Nat;
    uploadTime: Time.Time;
  };

  stable var nextFileId: Nat = 0;
  let files = HashMap.HashMap<Nat, FileInfo>(0, Nat.equal, Hash.hash);

  public func uploadFile(name: Text, content: Blob) : async Result.Result<Nat, Text> {
    let fileId = nextFileId;
    nextFileId += 1;

    let fileInfo: FileInfo = {
      id = fileId;
      name = name;
      size = Blob.toArray(content).size();
      uploadTime = Time.now();
    };

    files.put(fileId, fileInfo);
    #ok(fileId)
  };

  public query func getFiles() : async [FileInfo] {
    Array.tabulate(files.size(), func (i: Nat) : FileInfo {
      switch (files.get(i)) {
        case (?file) file;
        case null {
          {
            id = 0;
            name = "";
            size = 0;
            uploadTime = 0;
          }
        };
      }
    })
  };

  public func deleteFile(fileId: Nat) : async Result.Result<(), Text> {
    switch (files.remove(fileId)) {
      case (?_) #ok();
      case null #err("File not found");
    }
  };
}

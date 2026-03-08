import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Types
  public type ChatMessage = {
    id : Nat;
    role : Text;
    content : Text;
    imageUrl : ?Text;
    timestamp : Int;
    language : Text;
  };

  public type ConversationSession = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  module ConversationSession {
    public func compareByCreatedAt(session1 : ConversationSession, session2 : ConversationSession) : Order.Order {
      Nat.compare(session2.createdAt.toNat(), session1.createdAt.toNat());
    };
  };

  // State
  var nextMessageId = 0;
  var nextSessionId = 0;

  let messages = List.empty<ChatMessage>();
  let sessions = List.empty<ConversationSession>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Message functions
  public shared ({ caller }) func addMessage(_role : Text, _content : Text, _imageUrl : ?Text, _language : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };
    let message : ChatMessage = {
      id = nextMessageId;
      role = _role;
      content = _content;
      imageUrl = _imageUrl;
      timestamp = Time.now();
      language = _language;
    };
    messages.add(message);
    let currentId = nextMessageId;
    nextMessageId += 1;
    currentId;
  };

  public query ({ caller }) func getHistory() : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view message history");
    };
    messages.toArray();
  };

  public shared ({ caller }) func clearHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can clear history");
    };
    messages.clear();
  };

  public query ({ caller }) func generateResponse(userMessage : Text, _language : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate responses");
    };
    let lowerMsg = userMessage.toLower();

    if (lowerMsg.contains(#text "education") or lowerMsg.contains(#text "study")) {
      return "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.";
    };

    if (lowerMsg.contains(#text "coding") or lowerMsg.contains(#text "program")) {
      return "Consistency is the heart of effective programming!";
    };

    if (lowerMsg.contains(#text "business")) {
      return "Innovation distinguishes between a leader and a follower.";
    };

    if (lowerMsg.contains(#text "hello") or lowerMsg.contains(#text "hi")) {
      return "Hello! How can I assist you today?";
    };

    if (lowerMsg.contains(#text "earth") or lowerMsg.contains(#text "planet")) {
      return "Did you know that Earth is the only planet not named after a god?";
    };

    "I'm here to help! Please provide more details or ask another question.";
  };

  public query ({ caller }) func getImageMetadata(_prompt : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get image metadata");
    };
    // Example metadata response for frontend rendering
    "{" # "\"style\": \"realistic\", \"colorScheme\": \"neutral\", \"resolution\": \"1024x768\", \"subjectCount\": 1" # "}";
  };

  // Session functions
  public shared ({ caller }) func createSession(_name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create sessions");
    };
    let session : ConversationSession = {
      id = nextSessionId;
      name = _name;
      createdAt = Int.abs(Time.now());
    };
    sessions.add(session);
    let currentId = nextSessionId;
    nextSessionId += 1;
    currentId;
  };

  public query ({ caller }) func listSessions() : async [ConversationSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list sessions");
    };
    sessions.toArray().sort(ConversationSession.compareByCreatedAt);
  };

  public shared ({ caller }) func deleteSession(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete sessions");
    };

    let filteredSessions = sessions.values().toArray().filter(func(s) { s.id != id });
    sessions.clear();
    sessions.addAll(filteredSessions.values());
    true;
  };

  // Helper functions (if needed)
};

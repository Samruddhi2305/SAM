import os
import json
from bson import ObjectId
from pymongo import MongoClient
from app.config import settings

class JSONCollection:
    def __init__(self, filepath):
        self.filepath = filepath
        if not os.path.exists(filepath):
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, 'w') as f:
                json.dump([], f)

    def _read(self):
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except Exception:
            return []

    def _write(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, default=str, indent=2)

    def _matches(self, doc, query):
        for k, v in query.items():
            doc_val = doc.get(k)
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$gte":
                        if doc_val is None or str(doc_val) < str(op_val): return False
                    elif op == "$lte":
                        if doc_val is None or str(doc_val) > str(op_val): return False
                    elif op == "$gt":
                        if doc_val is None or str(doc_val) <= str(op_val): return False
                    elif op == "$lt":
                        if doc_val is None or str(doc_val) >= str(op_val): return False
                    elif op == "$ne":
                        if str(doc_val) == str(op_val): return False
            else:
                if isinstance(v, ObjectId):
                    v = str(v)
                if str(doc_val) != str(v):
                    return False
        return True

    def find_one(self, query):
        data = self._read()
        for doc in data:
            if self._matches(doc, query):
                return doc
        return None

    def find(self, query=None):
        data = self._read()
        if not query:
            return data
        return [doc for doc in data if self._matches(doc, query)]

    def insert_one(self, doc):
        data = self._read()
        if "_id" not in doc:
            doc["_id"] = str(ObjectId())
        else:
            doc["_id"] = str(doc["_id"])
        data.append(doc)
        self._write(data)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

    def update_one(self, query, update):
        data = self._read()
        matched = 0
        modified = 0
        for doc in data:
            if self._matches(doc, query):
                matched += 1
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        doc[uk] = uv
                    modified += 1
                break
        if modified > 0:
            self._write(data)
        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(matched, modified)

    def delete_one(self, query):
        data = self._read()
        new_data = []
        deleted = 0
        for doc in data:
            if self._matches(doc, query) and deleted == 0:
                deleted += 1
            else:
                new_data.append(doc)
        if deleted > 0:
            self._write(new_data)
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count
        return DeleteResult(deleted)

    def count_documents(self, query):
        return len(self.find(query))

# Try connection to real MongoDB first
use_fallback = False
try:
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=1500)
    client.admin.command('ping')
    db = client[settings.DATABASE_NAME]
    users_collection = db["users"]
    assets_collection = db["assets"]
    bookings_collection = db["bookings"]
    notifications_collection = db["notifications"]
    audit_logs_collection = db["audit_logs"]
    print("Database: Connected to live MongoDB.")
except Exception:
    use_fallback = True

if use_fallback:
    print("Database: MongoDB unavailable. Initializing JSON file fallback...")
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    users_collection = JSONCollection(os.path.join(data_dir, "users.json"))
    assets_collection = JSONCollection(os.path.join(data_dir, "assets.json"))
    bookings_collection = JSONCollection(os.path.join(data_dir, "bookings.json"))
    notifications_collection = JSONCollection(os.path.join(data_dir, "notifications.json"))
    audit_logs_collection = JSONCollection(os.path.join(data_dir, "audit_logs.json"))
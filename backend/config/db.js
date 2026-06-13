const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let dbType = 'mongodb';

// Ensure the local data directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Local Document Instance Mocking Mongoose Instance
class LocalDocument {
  constructor(model, data) {
    Object.assign(this, data);
    this._model = model;
  }

  async save() {
    const all = this._model._read();
    if (!this._id) {
      this._id = Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      this.createdAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
      all.push(this.toJSON());
      this._model._write(all);
    } else {
      const idx = all.findIndex(x => x._id === this._id);
      this.updatedAt = new Date().toISOString();
      if (idx !== -1) {
        all[idx] = this.toJSON();
      } else {
        all.push(this.toJSON());
      }
      this._model._write(all);
    }
    return this;
  }

  toJSON() {
    const copy = { ...this };
    delete copy._model;
    return copy;
  }
}

// Local Model Mocking Mongoose Model
class LocalModel {
  constructor(modelName, schemaDef) {
    this.modelName = modelName;
    this.filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
    this.schemaDef = schemaDef;
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  // To support new Model(data) instantiation
  instantiate(data) {
    return new LocalDocument(this, data);
  }

  async create(doc) {
    const inst = new LocalDocument(this, doc);
    return await inst.save();
  }

  async find(query = {}) {
    const data = this._read();
    const filtered = data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return filtered.map(d => new LocalDocument(this, d));
  }

  async findOne(query = {}) {
    const data = this._read();
    const found = data.find(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return found ? new LocalDocument(this, found) : null;
  }

  async findById(id) {
    return await this.findOne({ _id: id });
  }

  async findByIdAndDelete(id) {
    const data = this._read();
    const initialLength = data.length;
    const filtered = data.filter(item => item._id !== id);
    this._write(filtered);
    return filtered.length < initialLength ? { _id: id } : null;
  }

  async updateOne(query = {}, update = {}) {
    const data = this._read();
    let updatedCount = 0;
    const updatedData = data.map(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        let updatedItem = { ...item, ...update, updatedAt: new Date().toISOString() };
        if (update.$inc) {
          for (let k in update.$inc) {
            updatedItem[k] = (updatedItem[k] || 0) + update.$inc[k];
          }
          delete updatedItem.$inc;
        }
        return updatedItem;
      }
      return item;
    });
    this._write(updatedData);
    return { matchedCount: updatedCount, modifiedCount: updatedCount };
  }

  async insertMany(docs) {
    const data = this._read();
    const newDocs = docs.map(doc => ({
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    }));
    data.push(...newDocs);
    this._write(data);
    return newDocs.map(d => new LocalDocument(this, d));
  }
}

// Database Connection Orchestrator
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '') {
    console.log('🛸 LinkFlow Database: No MONGODB_URI found. Switching to holographic local JSON database mode.');
    dbType = 'local';
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('🛸 LinkFlow Database: Connected to MongoDB Atlas successfully.');
    dbType = 'mongodb';
  } catch (error) {
    console.error(`🚨 MongoDB connection failed: ${error.message}`);
    console.log('🛸 LinkFlow Database: Falling back to local JSON database mode.');
    dbType = 'local';
  }
};

// Model Compiler Helper
const compileModel = (modelName, schemaDef, schemaObj) => {
  // Return standard mongoose model if connected to mongodb, otherwise return mock
  return {
    create: async (doc) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).create(doc);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.create(doc);
      }
    },
    find: async (query) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).find(query);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.find(query);
      }
    },
    findOne: async (query) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).findOne(query);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.findOne(query);
      }
    },
    findById: async (id) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).findById(id);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.findById(id);
      }
    },
    findByIdAndDelete: async (id) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).findByIdAndDelete(id);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.findByIdAndDelete(id);
      }
    },
    updateOne: async (query, update) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).updateOne(query, update);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.updateOne(query, update);
      }
    },
    insertMany: async (docs) => {
      if (dbType === 'mongodb') {
        return await mongoose.model(modelName, schemaObj).insertMany(docs);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return await local.insertMany(docs);
      }
    },
    // To support instantiation: const inst = new Model(data)
    instantiate: (data) => {
      if (dbType === 'mongodb') {
        const MongooseModel = mongoose.model(modelName, schemaObj);
        return new MongooseModel(data);
      } else {
        const local = new LocalModel(modelName, schemaDef);
        return local.instantiate(data);
      }
    },
    getDbType: () => dbType
  };
};

module.exports = {
  connectDB,
  compileModel,
  dbType: () => dbType
};

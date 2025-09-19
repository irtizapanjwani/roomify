import mongoose from "mongoose";

const UserConnectionSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function(value) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: 'Invalid user ID format for user1'
    }
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function(value) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: 'Invalid user ID format for user2'
    }
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  requestSentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function(value) {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: 'Invalid user ID format for requestSentBy'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtuals for user information
UserConnectionSchema.virtual('user1Info', {
  ref: 'User',
  localField: 'user1',
  foreignField: '_id',
  justOne: true
});

UserConnectionSchema.virtual('user2Info', {
  ref: 'User',
  localField: 'user2',
  foreignField: '_id',
  justOne: true
});

// Ensure users can't connect to themselves
UserConnectionSchema.pre('validate', function(next) {
  if (this.user1.equals(this.user2)) {
    next(new Error('Cannot connect to yourself'));
  } else {
    next();
  }
});

// Ensure unique connections (user1-user2 and user2-user1 should be the same)
UserConnectionSchema.index({ user1: 1, user2: 1 }, { unique: true });
UserConnectionSchema.index({ user2: 1, user1: 1 }, { unique: true });

// Ensure users can't connect to themselves
UserConnectionSchema.pre('validate', function(next) {
  if (this.user1.equals(this.user2)) {
    next(new Error('Cannot connect to yourself'));
  } else {
    next();
  }
});

// Ensure unique connections (user1-user2 and user2-user1 should be the same)
UserConnectionSchema.index({ user1: 1, user2: 1 }, { unique: true });
UserConnectionSchema.index({ user2: 1, user1: 1 }, { unique: true });

export default mongoose.model("UserConnection", UserConnectionSchema);

const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
const Face = require('../models/Face');
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

class FacialRecognition {
  constructor() {
    this.faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
    this.faceMatcher = null;
    this.knownFaces = new Map();
  }

  async initialize() {
    try {
      // Load models
      await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
      await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
      await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
      
      // Load faces from database
      await this.loadFacesFromDatabase();
      
      console.log('Facial recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading facial recognition models:', error);
      throw error;
    }
  }

  async loadFacesFromDatabase() {
    try {
      const faces = await Face.find({ isActive: true });
      for (const face of faces) {
        this.knownFaces.set(face.userId, {
          label: face.label,
          descriptor: face.descriptor
        });
      }
      console.log(`Loaded ${faces.length} faces from database`);
    } catch (error) {
      console.error('Error loading faces from database:', error);
      throw error;
    }
  }

  async addFace(imageBuffer, userId, label) {
    try {
      const img = await canvas.loadImage(imageBuffer);
      const detection = await faceapi.detectSingleFace(img, this.faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected in the image');
      }

      const faceDescriptor = detection.descriptor;
      
      // Save to database
      const face = new Face({
        userId,
        label,
        descriptor: faceDescriptor
      });
      await face.save();

      // Update in-memory cache
      this.knownFaces.set(userId, {
        label,
        descriptor: faceDescriptor
      });

      return {
        success: true,
        message: 'Face added successfully',
        userId,
        label
      };
    } catch (error) {
      console.error('Error adding face:', error);
      throw error;
    }
  }

  async recognizeFace(imageBuffer) {
    try {
      const img = await canvas.loadImage(imageBuffer);
      const detection = await faceapi.detectSingleFace(img, this.faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return {
          success: false,
          message: 'No face detected in the image'
        };
      }

      const faceDescriptor = detection.descriptor;
      let bestMatch = null;
      let bestDistance = 1;

      // Compare with known faces
      for (const [userId, faceData] of this.knownFaces.entries()) {
        const distance = faceapi.euclideanDistance(faceDescriptor, faceData.descriptor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = {
            userId,
            label: faceData.label,
            confidence: 1 - distance
          };
        }
      }

      if (bestMatch && bestMatch.confidence > 0.6) {
        return {
          success: true,
          match: bestMatch
        };
      }

      return {
        success: false,
        message: 'No matching face found'
      };
    } catch (error) {
      console.error('Error recognizing face:', error);
      throw error;
    }
  }

  async verifyFace(imageBuffer, userId) {
    try {
      const img = await canvas.loadImage(imageBuffer);
      const detection = await faceapi.detectSingleFace(img, this.faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return {
          success: false,
          message: 'No face detected in the image'
        };
      }

      const faceDescriptor = detection.descriptor;
      const knownFace = this.knownFaces.get(userId);

      if (!knownFace) {
        return {
          success: false,
          message: 'User not found in database'
        };
      }

      const distance = faceapi.euclideanDistance(faceDescriptor, knownFace.descriptor);
      const confidence = 1 - distance;

      return {
        success: true,
        verified: confidence > 0.6,
        confidence
      };
    } catch (error) {
      console.error('Error verifying face:', error);
      throw error;
    }
  }

  async removeFace(userId) {
    try {
      // Update in database
      await Face.findOneAndUpdate(
        { userId },
        { isActive: false, lastUpdated: new Date() }
      );

      // Update in-memory cache
      const deleted = this.knownFaces.delete(userId);

      return {
        success: deleted,
        message: deleted ? 'Face removed successfully' : 'Face not found'
      };
    } catch (error) {
      console.error('Error removing face:', error);
      throw error;
    }
  }

  async listKnownFaces() {
    try {
      const faces = await Face.find({ isActive: true })
        .sort({ createdAt: -1 })
        .select('userId label createdAt');
      return faces;
    } catch (error) {
      console.error('Error listing faces:', error);
      throw error;
    }
  }
}

module.exports = new FacialRecognition(); 
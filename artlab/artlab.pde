import processing.net.*;
import java.util.Arrays;
import org.openkinect.freenect2.*;
import org.openkinect.processing.*; //<>//

Server server;
Kinect2 kinect2;

// Depth image
PImage depthImg;

int minDepth =  1200;
int maxDepth =  4800;
int depthDiff = maxDepth - minDepth;

float averageX;
float averageY;
float averageDepth;

int frontMinX = 0;
int frontMaxX = 512;
int backMinX = 150;
int backMaxX = 362;

int diffMinX = backMinX - frontMinX;
int diffMaxX = frontMaxX - backMaxX;



PVector front_left_bottom = new PVector(0,0);

void setup() {
  server = new Server(this, 5204);
  
  size(1400, 524);
  
  kinect2 = new Kinect2(this);
  kinect2.initVideo();
  kinect2.initDepth();
  //kinect2.initIR();
  //kinect2.initRegistered();
  // Start all data
  kinect2.initDevice();
  
  print(kinect2.depthWidth, kinect2.depthHeight);
  
  depthImg = new PImage(kinect2.depthWidth, kinect2.depthHeight);
  print(diffMinX, diffMaxX);
}

void draw() {
  background(255);
  frameRate(4);
  //image(kinect2.getDepthImage(), 0, 0);
  
  //  // Threshold the depth image
  int[] rawDepth = kinect2.getRawDepth();
  
  int size = 0;
  int sumX = 0;
  int sumY = 0;
  int sumDepth = 0;
  
  float[] arr = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
  
  for (int i = 0; i < 512; i++) {
     for (int j = 0; j < 424; j++) {
        int idx = j * 512 + i; 
        int depth = rawDepth[idx];
        
        if (depth > minDepth && depth < maxDepth) {
          float ratio = float(depth - minDepth) / depthDiff;
          
          int minX = int(diffMinX * ratio) + frontMinX;
          int maxX = frontMaxX - int(diffMaxX * ratio);
          float normalizedX = float(i - minX) / float(maxX - minX);
          float weight = (float(depth) / float(minDepth)) * (float(depth) / float(minDepth));
          
          //println(weight);
          if (normalizedX > 0 && normalizedX < 1 && j > 120) {
            
            int arrIdx = floor(normalizedX * 4) + floor(ratio * 4) * 4;
            arr[arrIdx] += weight;  
          }
          
          
          //size += 1;
          //sumX += i;
          //sumY += j;
          //sumDepth += depth;
          depthImg.pixels[idx] = color(150);
        } 
        else {
          depthImg.pixels[idx] = color(0);
        }
     }
  }

  //// Draw the thresholded image
  depthImg.updatePixels();
  image(depthImg, 0, 0);
  fill(0);
  if (size > 0) {
    textSize(40);
    text("x: " + sumX / size + " y: " + sumY / size + " depth: " + sumDepth / size, 50, 480);
  }
  
  float sum = 0;
  textSize(40);
  for (int i =0; i < 4; i++) {
     for (int j = 0; j < 4; j++) {
        
        text("" + int(arr[i + j * 4]), 520 + i * 200, 50 + j * 60);
        
        sum += arr[i + j * 4];
     }
  }
  
  
  
  
  text("all: " + sum, 520, 400); 
    
  

  //image(kinect2.getVideoImage(), 0, 0, kinect2.colorWidth*0.267, kinect2.colorHeight*0.267);
  
  //int[] depth = kinect2.getRawDepth();
  server.write(Arrays.toString(arr).replaceAll("\\s+",""));
}

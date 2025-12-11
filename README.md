## ✂️ Face Crop App

### **The Intelligent Batch Image Cropper**

The **Face Crop App** is a fast, client-side utility built with React and `face-api.js` designed for instant, automated facial recognition and precise cropping. It's ideal for quickly processing large batches of images for standardized formats like IDs, passports, or social media profile pictures.

The core workflow is: **Upload images or folders → Detect faces → Crop instantly.**

---

### ✨ Key Features

* **Intelligent Face Detection:** Uses advanced face recognition models to accurately locate faces in bulk.
* **Batch Processing:** Supports uploading entire folders or `.zip` archives for high-volume processing.
* **Flexible Cropping Modes:**
    * **Auto Crop Main Person:** Automatically selects and crops the largest or most centrally located face in an image.
    * **Crop All Faces:** Extracts every detected face from every image.
* **Precision Output:** Define exact output dimensions using **inches** (e.g., for passport photos), which the app converts to pixels using 96 DPI.
* **Client-Side Processing:** All detection and cropping happens entirely in your browser, ensuring maximum privacy and speed (no images are uploaded to a server).
* **Bulk Download:** Automatically bundles all cropped images into a single `.zip` file for easy download.

### ⚙️ Installation

Since this is a React application utilizing Node.js dependencies, here is the standard setup process:

1.  **Clone the repository:**
    ```bash
    git clone [git@github.com:MinKhantAung23/Face_Crop_AI.git]
    ```
2.  **Install Node dependencies:**
    ```bash
    npm install
    ```
3.  **Place Models:** The app relies on `face-api.js` models. You must download the necessary model files (e.g., `ssd_mobilenetv1_model.weights`, `face_landmark_68_model.weights`, etc.) and place them inside a folder named **`public/models`** in the root of your project directory. 
4.  **Run the application:**
    ```bash
    npm run dev
    ```

### 🚀 Usage Guide

The application is designed to be simple and intuitive.

#### **Step 1: Upload Images**

Use one of the two main input methods in the "Upload Images" section:

* **Files/ZIP:** Select individual files or a compressed `.zip` file containing images.
* **Folder:** Use the specialized input to select an entire folder for batch processing.

#### **Step 2: Define Cropping Options (Optional)**

* **Crop Mode:** Choose between **"Auto crop main person"** (default) or **"Crop all faces."**
* **Custom Size:** Enter a `Width (inches)` and `Height (inches)` for precise, standardized output sizes. Leave these fields blank for the app to auto-scale the crop based on the detected face size.

#### **Step 3: Detect and Download**

1.  Click the **"Detect & Crop Faces"** button. The app will load the images, run the detection models, and instantly crop the results.
2.  Once processing is complete, a **"Cropped Faces"** section will appear with image previews.
3.  Click the **"Download ZIP"** button to get a single archive of all your newly cropped images.

### 🛠️ Technologies Used

* **Frontend:** React, TypeScript, Tailwind CSS
* **Face Detection:** `face-api.js` (Web-based AI library)
* **File Handling:** `jszip` (for reading ZIPs), `file-saver` (for generating output ZIPs)


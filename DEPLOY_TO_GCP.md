# Deploying Attendance Backend to Google Cloud Run

Since you don't have the Google Cloud SDK installed locally, the easiest way is to use the **Google Cloud Shell** in your browser. It comes pre-installed with all the tools (docker, gcloud, git).

## Step 1: Prepare Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  Make sure **Billing** is enabled for the project.

## Step 2: Open Cloud Shell
1.  Click the **Activate Cloud Shell** icon (terminal prompt icon) in the top right toolbar of the console.
2.  Wait for the terminal to provision and connect.

## Step 3: Get Your Code into Cloud Shell
You need to get your project code into the Cloud Shell environment.
*   **Option A (GitHub):** If your code is on GitHub, run:
    ```bash
    git clone https://github.com/YourUsername/your-repo.git
    cd your-repo
    ```
*   **Option B (Upload):**  Click the "Three Dots" menu in the Cloud Shell toolbar -> **Upload** -> Select your project folder (you might need to zip it first).

## Step 4: Configure Project & Enable Services
Run these commands in the **Cloud Shell terminal**:

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable necessary APIs (Artifact Registry & Cloud Run)
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
```

## Step 5: Create an Artifact Registry Repository
This is where your Docker image will be stored.

```bash
# Create a repository named 'docker-repo' in us-central1
gcloud artifacts repositories create docker-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository"
```

## Step 6: Build and Push the Image
This command builds your Dockerfile in the cloud and pushes it to the registry.

```bash
# Submit the build (replace PROJECT_ID with your actual project ID)
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/docker-repo/gibi-backend .
```

*(Make sure you are in the directory containing the `Dockerfile`)*

## Step 7: Deploy to Cloud Run
Finally, deploy the service. **IMPORTANT:** You need to pass your database URL environment variable.

```bash
gcloud run deploy gibi-backend \
    --image us-central1-docker.pkg.dev/PROJECT_ID/docker-repo/gibi-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"
```
*   Replace the `DATABASE_URL` value with your actual production database connection string.
*   `--allow-unauthenticated` makes the API public. Remove this flag if you want it private.

## Step 8: Verification
Cloud Run will output a **Service URL** (e.g., `https://gibi-backend-xyz.a.run.app`).
Click it or use `curl` to verify it's running!

REGION=europe-west1

gcloud functions deploy testmailer \
  --runtime nodejs10 \
  --trigger-http \
  --allow-unauthenticated \
  --timeout 10 \
  --region $REGION \
  --memory 512MB \
  --max-instances 1
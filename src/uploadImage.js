import { supabase } from "./supabase";

export async function uploadImage(file, pgId, category) {
  const fileName = `${pgId}/${Date.now()}-${file.name}`;

  // Upload image to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("pg-images")
    .upload(fileName, file);

  if (uploadError) {
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from("pg-images")
    .getPublicUrl(fileName);

  const imageUrl = data.publicUrl;

  // Save image information in database
  const { error: databaseError } = await supabase
    .from("pg_images")
    .insert({
      pg_id: pgId,
      category: category,
      image_url: imageUrl,
    });

  if (databaseError) {
    throw databaseError;
  }

  return imageUrl;
}
import { supabase } from "./lib/supabase";

export async function uploadImage(file, pgId, category) {
  if (!file) {
    throw new Error("No image selected");
  }

  const cleanFileName = file.name.replace(
    /[^a-zA-Z0-9.-]/g,
    "_"
  );

  const filePath =
    `${pgId}/${Date.now()}-${cleanFileName}`;

  const {
    data: uploadData,
    error: uploadError,
  } = await supabase.storage
    .from("pg-images")
    .upload(
      filePath,
      file,
      {
        contentType: file.type,
        upsert: false,
      }
    );

  if (uploadError) {
    console.error(
      "STORAGE UPLOAD ERROR:",
      uploadError
    );

    throw new Error(
      `Image upload failed: ${uploadError.message}`
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("pg-images")
    .getPublicUrl(filePath);

  const imageUrl =
    publicUrlData.publicUrl;

  const {
    data: imageRecord,
    error: databaseError,
  } = await supabase
    .from("pg_images")
    .insert({
      pg_id: pgId,
      category,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (databaseError) {
    console.error(
      "DATABASE IMAGE ERROR:",
      databaseError
    );

    throw new Error(
      `Image database save failed: ${databaseError.message}`
    );
  }

  console.log(
    "IMAGE UPLOADED AND SAVED:",
    imageRecord
  );

  return imageUrl;
}
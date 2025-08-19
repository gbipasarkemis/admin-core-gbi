export const sendTestEmail = async () => {
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer mlsn.a46e71864000089b0a3c9e8f9b8a5ff31097fee8e4dd220866bf2f897b58224e",
      },
      body: JSON.stringify({
        from: {
          email: "noreply@test-r83ql3prwmmgzw1j.mlsender.net", // ✅ email valid
          name: "GBI Pasar Kemis",
        },
        to: [
          {
            email: "ezraricad2@gmail.com",
            name: "Ezra",
          },
        ],
        subject: "Tes Email dari Supabase",
        html: "<h1>Shalom Ezra!</h1><p>Ini email test dari Supabase Edge Function 🙌</p>",
      }),
    });
  
    const data = await res.json();
    console.log("Mailersend response:", data);
  };
  
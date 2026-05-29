import urllib.request
import zipfile
import io
import os

def download_plink_example():
    url = "https://www.cog-genomics.org/static/bin/plink/example.zip"
    target_dir = "tools"
    
    print(f"Downloading official PLINK tutorial dataset from: {url}")
    print("This file is ~23MB. Please wait...")
    
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            zip_data = response.read()
            print("Download complete. Extracting files...")
            
            with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_ref:
                # Extract files, flattening any "example/" directory structure
                for file_info in zip_ref.infolist():
                    # Get base filename
                    filename = os.path.basename(file_info.filename)
                    if not filename:
                        # Skip directories
                        continue
                    
                    target_path = os.path.join(target_dir, filename)
                    # Extract file directly
                    with zip_ref.open(file_info) as source, open(target_path, "wb") as target:
                        target.write(source.read())
                    print(f"  [OK] Extracted: {target_path}")
                    
        print("\nSuccess! The 'wgas1' and 'extra' datasets are now ready.")
        print("They will automatically appear in your Genomics Studio dropdown panel.")
    except Exception as e:
        print(f"\nError downloading or extracting dataset: {str(e)}")

if __name__ == "__main__":
    download_plink_example()

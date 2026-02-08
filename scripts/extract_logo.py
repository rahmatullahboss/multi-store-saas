from PIL import Image
import numpy as np

# Path to the source image
source_path = "/Users/rahmatullahzisan/.gemini/antigravity/brain/b8a2b5a3-8ace-4024-836f-f0b432c2ffbc/media__1770539777036.png"
output_path = "/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/landing/public/brand/ozzyl-logo-white-extracted.png"

try:
    img = Image.open(source_path).convert("RGBA")
    data = np.array(img)
    
    # Auto-crop logic:
    # 1. If image is fully transparent except logo, getbbox() works.
    # 2. If image has white background, we need to make it transparent first.
    
    # Check corners for background color
    corners = [data[0,0], data[0,-1], data[-1,0], data[-1,-1]]
    # If all corners are white (255,255,255,255)
    is_white_bg = all(np.all(c >= 250) for c in corners)
    
    if is_white_bg:
        print("Detected White Background. Removing...")
        # Make white pixels transparent
        red, green, blue = data[:,:,0], data[:,:,1], data[:,:,2]
        mask_white = (red > 240) & (green > 240) & (blue > 240)
        data[mask_white] = [0, 0, 0, 0] # Transparent
        img = Image.fromarray(data)

    # If all corners are transparent (0,0,0,0) or (x,x,x,0)
    # Then getbbox() will crop it nicely.
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"Cropped to query: {bbox}")
    else:
        print("Warning: Image seems empty or fully transparent?")

    # Save
    img.save(output_path)
    print(f"Successfully saved extracted logo to {output_path}")

except Exception as e:
    print(f"Error processing image: {e}")

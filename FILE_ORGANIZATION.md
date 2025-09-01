# Plant Photo File Organization

## New File Structure

Photos are now organized by plant ID with timestamps:

```
public/uploads/plants/
├── [plant-id-1]/
│   ├── 2024-08-29_12-30-15.jpg
│   ├── 2024-08-29_14-45-22.jpg
│   └── 2024-08-30_09-15-30.jpg
├── [plant-id-2]/
│   ├── 2024-08-29_16-20-10.jpg
│   └── 2024-08-30_11-30-45.jpg
```

## Features

1. **Plant-specific directories**: Each plant gets its own folder
2. **Timestamped filenames**: Format: `YYYY-MM-DD_HH-MM-SS.ext`
3. **Auto profile picture**: Latest photo automatically becomes plant's profile picture
4. **Chronological ordering**: Photos are naturally sorted by creation time

## Example Filename Format
- `2024-08-29_12-30-15.jpg` = Photo taken on August 29, 2024 at 12:30:15
- `2024-12-01_09-05-42.png` = Photo taken on December 1, 2024 at 09:05:42

## API Integration
When taking a photo through the camera modal:
1. Photo is saved to `/uploads/plants/[plant-id]/[timestamp].jpg`
2. Plant's `profileImageUrl` is automatically updated to the new photo
3. Watering record is created with the image URL
4. Plant's `lastWatered` is updated
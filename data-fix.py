import json
import os

def process_data():
    # Define file paths
    backup_json_path = 'backup.json'
    directory_json_path = 'directory.json'
    directory_2_json_path = 'directory-2.json'
    backup2_json_path = 'backup2.json'
    
    # Read backup.json
    try:
        with open(backup_json_path, 'r') as f:
            backup_data = json.load(f)
        print(f"Successfully read {backup_json_path}")
    except FileNotFoundError:
        print(f"{backup_json_path} not found")
        return
    
    # Read directory.json
    try:
        with open(directory_json_path, 'r') as f:
            directory_data = json.load(f)
        print(f"Successfully read {directory_json_path}")
    except FileNotFoundError:
        print(f"{directory_json_path} not found")
        return
    
    # Create a new dictionary for directory-2.json
    directory_2_data = {}
    
    # Create a new list for backup2.json (optimized version of backup.json)
    backup2_data = []
    
    # Create a lookup dictionary for faster searching
    thumbnail_to_entry = {}
    for entry in directory_data:
        if 'thumbnail' in entry:
            thumbnail_to_entry[entry['thumbnail']] = entry
    
    # Process each item in backup_data
    for item in backup_data:
        # Create a copy of the item to modify
        optimized_item = item.copy()
        
        # Check if metadata exists and has a thumbnail
        thumbnail_url = None
        if 'metadata' in item and isinstance(item['metadata'], dict) and 'thumbnail' in item['metadata']:
            thumbnail_url = item['metadata']['thumbnail']
        
        if thumbnail_url and thumbnail_url in thumbnail_to_entry:
            matching_entry = thumbnail_to_entry[thumbnail_url]
            
            # Get index and url from matching entry
            index = matching_entry.get('index')
            url = matching_entry.get('url')
            
            if url:
                # Add index and url to the optimized item
                optimized_item['index'] = index
                optimized_item['url'] = url
                
                # Extract metadata and title_extracted_entities for directory-2.json
                metadata = None
                if 'metadata' in optimized_item:
                    metadata = optimized_item.pop('metadata')
                
                title_extracted_entities = None
                if 'title_extracted_entities' in optimized_item:
                    title_extracted_entities = optimized_item.pop('title_extracted_entities')
                
                # Add to directory-2.json if key doesn't exist already
                if url not in directory_2_data:
                    directory_2_data[url] = {
                        'metadata': metadata,
                        'title_extracted_entities': title_extracted_entities
                    }
        
        # Add optimized item to backup2_data
        backup2_data.append(optimized_item)
    
    # Write to directory-2.json
    try:
        with open(directory_2_json_path, 'w') as f:
            json.dump(directory_2_data, f, indent=2)
        print(f"Successfully created {directory_2_json_path}")
    except Exception as e:
        print(f"Error writing to {directory_2_json_path}: {e}")
    
    # Write to backup2.json
    try:
        with open(backup2_json_path, 'w') as f:
            json.dump(backup2_data, f, indent=2)
        print(f"Successfully created {backup2_json_path}")
    except Exception as e:
        print(f"Error writing to {backup2_json_path}: {e}")

if __name__ == "__main__":
    process_data()

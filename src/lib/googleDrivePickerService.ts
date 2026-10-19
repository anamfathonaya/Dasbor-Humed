/**
 * Google Drive File Picker Integration Service
 * Allows users to select files from Google Drive to attach to tasks, projects, and content items
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: number;
  modifiedTime?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
}

export interface PickerOptions {
  viewId?: 'DOCS' | 'FOLDERS' | 'DOCS_IMAGES' | 'DOCS_VIDEOS';
  mimeTypes?: string[];
  multiSelect?: boolean;
  locale?: string;
}

/**
 * Load Google Picker API script
 */
export async function loadPickerApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    // Check if already loaded
    if ((window as any).google?.picker) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('picker', () => {
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google Picker API'));
    document.body.appendChild(script);
  });
}

/**
 * Open Google Drive file picker
 */
export async function openDrivePicker(
  accessToken: string,
  options: PickerOptions = {}
): Promise<DriveFile[]> {
  await loadPickerApi();

  const {
    viewId = 'DOCS',
    mimeTypes,
    multiSelect = false,
    locale = 'id',
  } = options;

  return new Promise((resolve, reject) => {
    const google = (window as any).google;

    if (!google?.picker) {
      reject(new Error('Google Picker not loaded'));
      return;
    }

    const view = new google.picker.DocsView(google.picker.ViewId[viewId]);

    if (mimeTypes && mimeTypes.length > 0) {
      view.setMimeTypes(mimeTypes.join(','));
    }

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '')
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const files: DriveFile[] = data.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            webViewLink: doc.url,
            iconLink: doc.iconUrl,
            thumbnailLink: doc.thumbnailUrl,
            size: doc.sizeBytes,
            modifiedTime: doc.lastEditedUtc,
          }));
          resolve(files);
        } else if (data.action === google.picker.Action.CANCEL) {
          resolve([]);
        }
      })
      .setTitle('Pilih File dari Google Drive')
      .setLocale(locale);

    if (multiSelect) {
      picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
    }

    picker.build().setVisible(true);
  });
}

/**
 * Get file metadata from Google Drive
 */
export async function getDriveFileMetadata(
  fileId: string,
  accessToken: string
): Promise<DriveFile | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,iconLink,thumbnailLink,size,modifiedTime,owners`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file metadata: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      webViewLink: data.webViewLink,
      iconLink: data.iconLink,
      thumbnailLink: data.thumbnailLink,
      size: data.size ? parseInt(data.size, 10) : undefined,
      modifiedTime: data.modifiedTime,
      owners: data.owners,
    };
  } catch (error) {
    console.error('Failed to get Drive file metadata:', error);
    return null;
  }
}

/**
 * Create a new Google Doc
 */
export async function createGoogleDoc(
  title: string,
  accessToken: string
): Promise<DriveFile | null> {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        mimeType: 'application/vnd.google-apps.document',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      webViewLink: `https://docs.google.com/document/d/${data.id}/edit`,
    };
  } catch (error) {
    console.error('Failed to create Google Doc:', error);
    return null;
  }
}

/**
 * Create a new Google Sheet
 */
export async function createGoogleSheet(
  title: string,
  accessToken: string
): Promise<DriveFile | null> {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      webViewLink: `https://docs.google.com/spreadsheets/d/${data.id}/edit`,
    };
  } catch (error) {
    console.error('Failed to create Google Sheet:', error);
    return null;
  }
}

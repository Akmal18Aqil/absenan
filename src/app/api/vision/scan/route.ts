import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // We would parse FormData here to get the image
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    // Stub for Vision API integration
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response mimicking OCR data extraction
    const mockData = {
      group_id: 'sample-group-id',
      date: new Date().toISOString().split('T')[0],
      attendance: [
        { nim: '1001', status: 'Setor' },
        { nim: '1002', status: 'Alfa' }
      ]
    };

    return NextResponse.json({ success: true, data: mockData });
  } catch {
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}

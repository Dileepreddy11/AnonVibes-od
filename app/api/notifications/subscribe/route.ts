import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * POST /api/notifications/subscribe
 * Stores the user's push subscription in Firestore
 * This allows the backend to send push notifications even when the app is closed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subscription } = body

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'userId and subscription are required' },
        { status: 400 }
      )
    }

    // Store subscription in Firestore
    // This enables backend push notifications
    const subscriptionRef = doc(db, 'users', userId, 'pushSubscriptions', 'web')
    
    await setDoc(subscriptionRef, {
      subscription,
      enabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userAgent: request.headers.get('user-agent'),
    })

    console.log('[v0] Stored push subscription for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Push subscription stored successfully',
    })
  } catch (error) {
    console.error('[v0] Error storing push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to store push subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Removes the user's push subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const subscriptionRef = doc(db, 'users', userId, 'pushSubscriptions', 'web')
    
    await setDoc(subscriptionRef, {
      enabled: false,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    console.log('[v0] Disabled push subscription for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Push subscription disabled',
    })
  } catch (error) {
    console.error('[v0] Error disabling push subscription:', error)
    return NextResponse.json(
      { error: 'Failed to disable push subscription' },
      { status: 500 }
    )
  }
}

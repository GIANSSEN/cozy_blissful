<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get latest 20 notifications for admin.
     */
    public function index()
    {
        $notifications = Notification::orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($n) {
                return [
                    'id'             => $n->id,
                    'type'           => $n->type,
                    'title'          => $n->title,
                    'desc'           => $n->description,
                    'time'           => $this->humanTime($n->created_at),
                    'unread'         => !$n->is_read,
                    'appointment_id' => $n->appointment_id,
                    'icon'           => $this->iconForType($n->type),
                ];
            });

        $unreadCount = Notification::where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead($id)
    {
        $notif = Notification::findOrFail($id);
        $notif->is_read = true;
        $notif->save();

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /* ── Helpers ─────────────────────────────────────────────────────────── */

    private function humanTime($date)
    {
        if (!$date) return '';

        $cDate   = Carbon::parse($date);
        $seconds = intval(abs(Carbon::now()->diffInSeconds($cDate)));

        if ($seconds < 10)     return 'Just now';
        if ($seconds < 60)     return $seconds . 's ago';
        if ($seconds < 3600)   return intval($seconds / 60) . 'm ago';
        if ($seconds < 86400)  return intval($seconds / 3600) . 'h ago';
        if ($seconds < 604800) return intval($seconds / 86400) . 'd ago';

        return $cDate->format('M d');
    }

    private function iconForType($type)
    {
        return match ($type) {
            'new_booking' => '📅',
            'confirmed'   => '✅',
            'completed'   => '🏆',
            'cancelled'   => '❌',
            'reminder'    => '⏰',
            default       => '🔔',
        };
    }
}

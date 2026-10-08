import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, BellOff, Briefcase, CheckCheck, ClipboardList, FlaskConical, Megaphone, MessageSquareReply, ShieldCheck, Star, Trash2, UserPlus, Vote } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useActivity } from "../../context/ActivityContext";
import { PersonAvatar } from "../../context/PeopleContext";
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from "../../services/api";
import { millis, timeAgo } from "../../utils/format";
import { EmptyState, PageHeader, PostTypeBadge, Spinner } from "../../components/ui";

const TYPE_ICONS = {
  application: ClipboardList,
  application_status: ClipboardList,
  shortlist: Star,
  referral: Star,
  account: ShieldCheck,
  reply: MessageSquareReply,
  registration: UserPlus,
};
const POST_ICONS = { hiring: Briefcase, test: FlaskConical, notice: Megaphone, poll: Vote };

const feedPath = (role) => (role === "admin" ? "/admin/content" : `/${role}`);

export const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, notificationsLoading, unreadNotifications, recentPosts, postsSeenAt, markPostsSeen } = useActivity();

  // Opening this page counts as having seen the new posts — they stay listed here until the next visit.
  const [since] = useState(postsSeenAt);
  useEffect(() => {
    markPostsSeen();
  }, [markPostsSeen]);
  const posts = recentPosts.filter((p) => p.authorUid !== user.uid && millis(p.createdAt, 0) > since);

  const open = (n) => {
    if (!n.read) markNotificationRead(n.id).catch(() => {});
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Updates on your account and activity."
        actions={
          unreadNotifications > 0 && (
            <button className="btn btn-secondary" onClick={() => markAllNotificationsRead(notifications).catch(() => {})}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )
        }
      />

      {posts.length > 0 && (
        <section className="space-y-2">
          <h2 className="section-title">New posts</h2>
          <ul className="card divide-y divide-slate-100">
            {posts.map((p) => {
              const Icon = POST_ICONS[p.type] || Megaphone;
              return (
                <li key={p.id}>
                  <Link to={feedPath(user.role)} className="flex items-start gap-3 p-4 hover:bg-slate-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900">
                        <strong>{p.authorName}</strong> posted <span className="font-medium">“{p.title}”</span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <PostTypeBadge type={p.type} />
                        <span className="text-xs text-slate-400">{timeAgo(p.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="space-y-2">
        {posts.length > 0 && <h2 className="section-title">For you</h2>}
        {notificationsLoading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications yet" text="Updates about your activity will appear here." />
        ) : (
          <ul className="card divide-y divide-slate-100">
            {notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              return (
                <li key={n.id} className={`group flex items-start gap-3 p-4 ${n.read ? "" : "bg-blue-50/50"}`}>
                  <button className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={() => open(n)}>
                    <div className="relative">
                      <PersonAvatar uid={n.fromUid} name={n.fromName} size="sm" />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-slate-200">
                        <Icon className="h-3 w-3" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? "text-slate-700" : "font-semibold text-slate-900"}`}>{n.title}</p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{n.body}</p>}
                      <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread" />}
                  </button>
                  <button
                    className="btn btn-ghost p-1.5 text-slate-400 opacity-100 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => deleteNotification(n.id).catch(() => {})}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
};

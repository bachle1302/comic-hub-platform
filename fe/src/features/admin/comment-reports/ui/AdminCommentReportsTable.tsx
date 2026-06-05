"use client";

import { Button } from "@/components/ui/button";
import type {
  AdminCommentReport,
  CommentReportStatus,
} from "../api/admin-comment-reports.schema";

type AdminCommentReportsTableProps = {
  reports: AdminCommentReport[];
  onDeleteComment: (id: number) => Promise<void> | void;
  onStatusChange: (
    id: number,
    status: CommentReportStatus,
  ) => Promise<void> | void;
};

const statuses: CommentReportStatus[] = ["PENDING", "RESOLVED", "REJECTED"];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getUserLabel(user?: { email?: string; name: string }): string {
  if (!user) {
    return "Nguoi dung";
  }

  return user.email ? `${user.name} (${user.email})` : user.name;
}

function isDeletedComment(report: AdminCommentReport): boolean {
  return Boolean(report.comment?.isDeleted || report.comment?.deletedAt);
}

export function AdminCommentReportsTable({
  reports,
  onDeleteComment,
  onStatusChange,
}: AdminCommentReportsTableProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Khong co bao cao nao.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Report</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ly do</th>
              <th className="px-4 py-3 font-medium">Reporter</th>
              <th className="px-4 py-3 font-medium">Comment</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Context</th>
              <th className="px-4 py-3 font-medium">Ngay tao</th>
              <th className="px-4 py-3 text-right font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const isDeleted = isDeletedComment(report);

              return (
              <tr key={report.id} className="border-t align-top">
                <td className="px-4 py-3">#{report.id}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    {report.status}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="line-clamp-3 whitespace-pre-line">
                    {report.reason}
                  </p>
                </td>
                <td className="px-4 py-3">{getUserLabel(report.user)}</td>
                <td className="max-w-sm px-4 py-3">
                  {report.comment ? (
                    <>
                      <p className="line-clamp-3 whitespace-pre-line">
                        {report.comment.content}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Comment #{report.comment.id}
                      </p>
                      {isDeleted ? (
                        <div className="mt-2 space-y-1">
                          <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                            Deleted
                          </span>
                          {report.comment.deletedAt ? (
                            <p className="text-xs text-muted-foreground">
                              Deleted: {formatDate(report.comment.deletedAt)}
                            </p>
                          ) : null}
                          {report.comment.deleteReason ? (
                            <p className="text-xs text-muted-foreground">
                              Reason: {report.comment.deleteReason}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Da bi xoa</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {getUserLabel(report.comment?.user)}
                </td>
                <td className="px-4 py-3">
                  {report.comment?.comic ? (
                    <p>
                      {report.comment.comic.name} #{report.comment.comic.id}
                    </p>
                  ) : null}
                  {report.comment?.chapter ? (
                    <p className="text-xs text-muted-foreground">
                      Chapter {report.comment.chapter.chapterNumber}:{" "}
                      {report.comment.chapter.name} #
                      {report.comment.chapter.id}
                    </p>
                  ) : null}
                  {!report.comment?.comic && !report.comment?.chapter ? (
                    <span className="text-muted-foreground">-</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{formatDate(report.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      {statuses.map((status) => (
                        <Button
                          key={status}
                          type="button"
                          size="sm"
                          variant={
                            report.status === status ? "default" : "outline"
                          }
                          disabled={report.status === status}
                          onClick={() => void onStatusChange(report.id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={isDeleted}
                      onClick={() => {
                        if (window.confirm("Xoa comment bi bao cao nay?")) {
                          void onDeleteComment(report.id);
                        }
                      }}
                    >
                      {isDeleted ? "Da xoa" : "Xoa comment"}
                    </Button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

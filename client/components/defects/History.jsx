import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function History({ history = [] }) {
  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800", 
      in_review: "bg-purple-100 text-purple-800",
      closed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800", 
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>История изменений ({history.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">История изменений пуста</p>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b last:border-b-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.timestamp), { 
                        addSuffix: true, 
                        locale: ru 
                      })}
                    </span>
                  </div>
                  
                  {entry.changes && (
                    <div className="space-y-1">
                      {entry.changes.status && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Статус:</span>
                          <Badge className={getStatusColor(entry.changes.status)}>
                            {entry.changes.status}
                          </Badge>
                        </div>
                      )}
                      
                      {entry.changes.priority && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Приоритет:</span>
                          <Badge className={getPriorityColor(entry.changes.priority)}>
                            {entry.changes.priority}
                          </Badge>
                        </div>
                      )}
                      
                      {entry.changes.assigneeId && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Исполнитель:</span>
                          <span className="text-xs">{entry.changes.assigneeName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {entry.reason && (
                    <p className="text-xs text-muted-foreground">{entry.reason}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

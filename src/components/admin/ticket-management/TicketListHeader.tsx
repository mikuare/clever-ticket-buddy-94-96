
interface TicketListHeaderProps {
  selectedDepartment: string;
  ticketCount: number;
  totalCount: number;
}

const TicketListHeader = ({ selectedDepartment, ticketCount, totalCount }: TicketListHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {selectedDepartment === 'all' ? 'All Tickets' : `${selectedDepartment} Department Tickets`}
      </h2>
      <div className="text-sm text-muted-foreground">
        <span>
          Showing {ticketCount} of {totalCount} ticket{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default TicketListHeader;

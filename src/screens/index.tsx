import { Route, Switch } from 'wouter';

import { BoardListScreen } from './board-list';
import { EntryScreen } from './entry';
import { ViewWorklogsScreen } from './view-worklogs';

export const Screens = () => (
  <Switch>
    <Route path="/board/:boardId/worklogs">
      {(params) => <ViewWorklogsScreen boardId={parseInt(params.boardId, 10)} />}
    </Route>
    <Route path="/boards">
      <BoardListScreen title="Select a board" backUrl="/" />
    </Route>
    <Route path="/">
      <EntryScreen title="Select a profile" />
    </Route>
  </Switch>
);
